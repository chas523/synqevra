import { Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Hl7Message } from '@medplum/core';
import { Patient, Encounter, Practitioner } from '@medplum/fhirtypes';

import { MedplumClient } from '@medplum/core';
import { MedplumConnectionService } from '../connection/medplum-connection.service';
import {
  mapHL7PatientClassToFHIR,
  mapADTTypeToEncounterStatus,
  mapAssigningAuthority,
  SUPPORTED_ADT_TYPES,
} from './utils/hl7-mapping.utils';
import { formatHL7DateTime } from './utils/datetime.utils';
import {
  buildAck,
  determineErrorDetails,
  buildFallbackHl7Message,
} from './utils/hl7-ack.utils';

interface PractitionerCacheEntry {
  practitioner: Practitioner;
  timestamp: number;
}

export class UnsupportedMessageTypeError extends Error {
  constructor(messageType: string) {
    super(`Unsupported message type: ${messageType}`);
    this.name = 'UnsupportedMessageTypeError';
  }
}

export class Hl7ParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Hl7ParsingError';
  }
}

@Injectable()
@Processor('hl7-processing')
export class Hl7MapperService extends WorkerHost {
  constructor(private readonly medplum: MedplumConnectionService) {
    super();
  }
  //cache
  private processedMessages = new Map<string, number>();
  private readonly MESSAGE_CACHE_TTL = 10 * 60 * 1000;

  private practitionerCache = new Map<string, PractitionerCacheEntry>();
  private CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds
  private CACHE_CLEANUP_INTERVAL = 60 * 1000; // Clean cache every minute
  private lastCacheCleanup = Date.now();

  async process(
    job: Job<{ rawMessage: string; tenantId: string }, any, string>,
  ): Promise<any> {
    const { rawMessage, tenantId } = job.data;
    try {
      const hl7Message = Hl7Message.parse(rawMessage);
      const client: MedplumClient =
        await this.medplum.initMedplumWithProjectId(tenantId);

      await this.parseHl7Message(hl7Message, client);

      const ackString = buildAck(hl7Message, 'AA');

      return {
        success: true,
        ackCode: 'AA',
        ackMessage: ackString,
      };
    } catch (error) {
      console.error('HL7 processing failed:', error);

      const processedError =
        error instanceof Error ? error : new Error('Unknown error occurred');
      const { ackCode, errorDetails } = determineErrorDetails(processedError);

      const fallbackMessage = buildFallbackHl7Message(rawMessage);
      const ackString = buildAck(fallbackMessage, ackCode, errorDetails);

      return {
        success: false,
        ackCode,
        ackMessage: ackString,
        error: processedError.message,
      };
    }
  }

  private async parseHl7Message(hl7Message: Hl7Message, client: MedplumClient) {
    try {
      //validate message type first
      const messageType = this.getMessageType(hl7Message);
      console.log(messageType);
      if (!SUPPORTED_ADT_TYPES.includes(messageType)) {
        console.log('Unsupported HL7 message type:', messageType);
        throw new UnsupportedMessageTypeError(messageType);
      }

      //cache mechanism, delete if not needed
      const alreadyProcessed = this.wasAlreadyProcessed(hl7Message);
      if (alreadyProcessed) {
        return;
      }

      //if message type is ADT_A40 - we merge two patients:
      if (this.getMessageType(hl7Message) === 'A40') {
        console.log('Processing patient merge (A40)');
        await this.mergeTwoPatients(hl7Message, client);
        return;
      } else {
        //extract patient
        const newPatient = this.createPatientFromPID(hl7Message);
        console.log('Created patient:', newPatient);

        //look for existing patient in medplum database
        let patient = await this.findPatientOptimized(client, newPatient);
        //patient exists in medplum database
        if (patient) {
          console.log('Found existing patient:', patient);
          patient = await this.updateExistingPatient(
            newPatient,
            client,
            patient,
          );
        }
        //patient does not exist, create new
        else {
          console.log('No existing patient found, creating new patient');
          patient = await client.createResource({
            ...newPatient,
            resourceType: 'Patient',
          });
        }
        //extract encounter
        console.log('Processing PV1 segment for encounter');
        const newEncounter = await this.createEncounterFromPV1(
          client,
          hl7Message,
          messageType,
          `Patient/${patient.id}`,
        );

        //only process encounter if it has meaningful data
        //we don't throw error if PV1 segment is missing, it's not required to assume that hl7 message is valid
        //we just skip encounter creation if there is no PV1 segment
        if (newEncounter.resourceType === 'Encounter' && newEncounter.status) {
          //look for existing encounter in medplum database
          let encounter = await this.findEncounter(client, newEncounter);
          //found existing encounter
          if (encounter) {
            console.log('Found existing encounter:', encounter);
            encounter = await this.updateExistingEncounter(
              newEncounter,
              client,
              encounter,
            );
          } else {
            //no existing encounter, create new
            console.log(`Creating new encounter`);
            encounter = await client.createResource(newEncounter as Encounter);
          }
        } else {
          console.log(
            'Skipping encounter creation - no PV1 segment or insufficient data',
          );
        }
      }
      console.log('Successfully processed HL7 message');
    } catch (error) {
      throw new Hl7ParsingError(
        error instanceof Error ? error.message : 'HL7 parsing failed',
      );
    }
  }

  private readonly ORGANIZATION_ID = 'orgid';
  private readonly ORGANIZATION_NAME = 'organization name';
  private readonly ORGANIZATION_SYSTEM = 'org-system';

  private createPatientFromPID(message: Hl7Message): Partial<Patient> {
    const pidSegment = message.getSegment('PID');
    //we throw error if PID segment is missing, it's required to assume that hl7 message is valid
    if (!pidSegment) {
      throw new Hl7ParsingError('Missing required PID segment');
    }

    try {
      const patient: Partial<Patient> = {
        resourceType: 'Patient',
        managingOrganization: {
          reference: `Organization/${this.ORGANIZATION_ID}`,
          display: this.ORGANIZATION_NAME,
        },
      };
      const patientIdField = pidSegment.getField(3);
      if (patientIdField) {
        const fieldString = patientIdField.toString();
        const repetitions = fieldString.split('~');
        const firstRepetition = repetitions[0];

        if (firstRepetition && firstRepetition.trim()) {
          const components = firstRepetition.split('^');

          const idNumber = components[0]?.trim();
          const assigner = components[3]?.trim();
          const idTypeCode = components[4]?.trim();

          if (idNumber) {
            const system = mapAssigningAuthority(
              assigner,
              idTypeCode,
              this.ORGANIZATION_SYSTEM,
            );

            patient.identifier = [
              {
                use: 'usual' as const,
                system: system,
                value: idNumber,
                type: {
                  coding: [
                    {
                      system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                      code: idTypeCode || 'MR',
                    },
                  ],
                },
              },
            ];
          }
        }
      }

      const patientNameField = pidSegment.getField(5);
      if (patientNameField) {
        const familyName = patientNameField.getComponent(1) || '';
        const givenName = patientNameField.getComponent(2) || '';
        const middleName = patientNameField.getComponent(3) || '';

        const nameObject: any = {
          use: 'official',
          given: [givenName, middleName].filter(Boolean),
        };

        if (familyName) {
          nameObject.family = familyName;
        }

        patient.name = [nameObject];
      }

      const birthDateField = pidSegment.getField(7);
      if (birthDateField) {
        const birthDate = birthDateField.toString();
        if (birthDate && birthDate.length >= 8) {
          const year = birthDate.substring(0, 4);
          const month = birthDate.substring(4, 6);
          const day = birthDate.substring(6, 8);
          patient.birthDate = `${year}-${month}-${day}`;
        }
      }

      const genderField = pidSegment.getField(8);
      if (genderField) {
        const gender = genderField.toString().toUpperCase();
        switch (gender) {
          case 'M':
            patient.gender = 'male';
            break;
          case 'F':
            patient.gender = 'female';
            break;
          case 'O':
            patient.gender = 'other';
            break;
          case 'U':
            patient.gender = 'unknown';
            break;
          default:
            patient.gender = 'unknown';
        }
      }

      const addressField = pidSegment.getField(11);
      if (addressField) {
        const streetAddress = addressField.getComponent(1) || '';
        const city = addressField.getComponent(3) || '';
        const state = addressField.getComponent(4) || '';
        const postalCode = addressField.getComponent(5) || '';
        const country = addressField.getComponent(6) || '';

        let countryCode = country;
        if (country === 'UNITED STATES OF AMERICA' || country === 'USA') {
          countryCode = 'US';
        }

        patient.address = [
          {
            use: 'home',
            line: [streetAddress].filter(Boolean),
            city: city,
            state: state,
            postalCode: postalCode,
            country: countryCode,
          },
        ];
      }

      const phoneField = pidSegment.getField(13);
      if (phoneField) {
        const telecom: any[] = [];

        for (let repetition = 0; repetition < 5; repetition++) {
          try {
            const getComponentSafe = (index: number): string | undefined => {
              try {
                const result = phoneField.getComponent(
                  index,
                  undefined,
                  repetition,
                );
                return result?.toString()?.trim() || undefined;
              } catch {
                return undefined;
              }
            };

            const phoneNumber = getComponentSafe(1);
            const use = getComponentSafe(2);
            const extension = getComponentSafe(3);

            if (!phoneNumber) {
              break;
            }

            let fullNumber = phoneNumber;
            if (extension) {
              fullNumber = `${fullNumber}x${extension}`;
            }

            fullNumber = fullNumber.replace(/[^0-9x\-()\s]/g, '');

            if (
              fullNumber.endsWith('x') &&
              (!extension || extension === 'CP' || extension === 'P')
            ) {
              fullNumber = fullNumber.slice(0, -1);
            }

            let useValue:
              | 'home'
              | 'work'
              | 'temp'
              | 'old'
              | 'mobile'
              | undefined = 'home';
            if (use === 'PRN') {
              useValue = 'home';
            } else if (use === 'WPN') {
              useValue = 'work';
            }

            telecom.push({
              system: 'phone' as const,
              value: fullNumber,
              use: useValue,
            });
          } catch {
            break;
          }
        }

        if (telecom.length > 0) {
          patient.telecom = telecom;
        }
      }

      return patient;
    } catch (error) {
      throw new Hl7ParsingError(
        `Error parsing PID segment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private wasAlreadyProcessed(hl7Message?: Hl7Message): boolean {
    if (!hl7Message) return false;
    const controlId = hl7Message.getSegment('MSH')?.getField(10)?.toString();
    if (!controlId) return false;

    this.cleanupProcessedMessages();
    if (this.processedMessages.has(controlId)) {
      console.log(`Skipping already processed message ${controlId}`);
      return true;
    }

    this.processedMessages.set(controlId, Date.now());
    return false;
  }

  private cleanupProcessedMessages(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.processedMessages.entries()) {
      if (now - timestamp > this.MESSAGE_CACHE_TTL) {
        this.processedMessages.delete(key);
      }
    }
  }
  private getMessageType(message: Hl7Message): string {
    try {
      const messageTypeField = message.getSegment('MSH')?.getField(9);
      if (!messageTypeField) {
        return '';
      }
      return messageTypeField.getComponent(2) || '';
    } catch {
      return '';
    }
  }
  private async mergeTwoPatients(
    hl7Message: Hl7Message,
    medplum: MedplumClient,
  ) {
    const pidSegment = hl7Message.getSegment('PID');
    const mrgSegment = hl7Message.getSegment('MRG');

    const newId = pidSegment?.getField(3)?.toString();
    const oldId = mrgSegment?.getField(1)?.toString();

    if (newId && oldId) {
      const newPatient = await medplum.searchOne(
        'Patient',
        `identifier=${newId}`,
      );
      const oldPatient = await medplum.searchOne(
        'Patient',
        `identifier=${oldId}`,
      );

      if (newPatient && oldPatient) {
        const encounters = await medplum.search(
          'Encounter',
          `subject=Patient/${oldPatient.id}`,
        );
        for (const entry of encounters.entry || []) {
          const e = entry.resource as Encounter;
          await medplum.updateResource({
            ...e,
            subject: {
              reference: `Patient/${newPatient.id}`,
            },
          });
        }

        await medplum.updateResource({
          ...oldPatient,
          active: false,
          extension: [
            {
              url: 'https://yourapp.com/fhir/StructureDefinition/merged-to',
              valueReference: {
                reference: `Patient/${newPatient.id}`,
              },
            },
          ],
        });

        await medplum.updateResource({
          ...newPatient,
          link: [
            ...(newPatient.link || []),
            {
              other: {
                reference: `Patient/${oldPatient.id}`,
              },
              type: 'replaces',
            },
          ],
        });

        console.log(`Merged Patient ${oldId} → ${newId}`);
      }
    }

    return hl7Message.buildAck({
      ackCode: 'AA',
    });
  }
  // Optimized patient search using bundle query for better performance
  private async findPatientOptimized(
    medplum: MedplumClient,
    patient: Partial<Patient>,
  ): Promise<Patient | null> {
    if (!patient.identifier || patient.identifier.length === 0) {
      return null;
    }
    const primaryIdentifier = patient.identifier[0];
    const validIdentifiers = [
      {
        system: primaryIdentifier.system as string,
        value: primaryIdentifier.value as string,
      },
    ];

    const identifiers: { system: string; value: string }[] = validIdentifiers;

    try {
      // Use only the primary identifier for search to avoid complexity
      const primaryIdentifier = identifiers[0];
      const query = `identifier=${primaryIdentifier.system}|${primaryIdentifier.value}`;

      console.log(
        `Searching patient with primary identifier: ${primaryIdentifier.system}|${primaryIdentifier.value}`,
      );

      // Use searchOne which returns the first match
      const patient = await medplum.searchOne('Patient', query);
      return patient || null; // Explicitly convert undefined to null
    } catch (_error) {
      console.log('Error in optimized patient search');
      return null;
    }
  }
  private async updateExistingPatient(
    newPatient: Partial<Patient>,
    client: MedplumClient,
    existingPatient: Patient,
  ) {
    const existingIdentifiers = existingPatient.identifier || [];
    const newIdentifiers = newPatient.identifier || [];

    // Merge identifiers, avoiding duplicates
    const mergedIdentifiers = [...existingIdentifiers];
    for (const newId of newIdentifiers) {
      const normalizedNewSystem = newId.system?.trim().toLowerCase();
      const normalizedNewValue = newId.value?.trim();

      const exists = mergedIdentifiers.some((existing) => {
        const normalizedExistingSystem = existing.system?.trim().toLowerCase();
        const normalizedExistingValue = existing.value?.trim();
        return (
          normalizedExistingSystem === normalizedNewSystem &&
          normalizedExistingValue === normalizedNewValue
        );
      });

      if (!exists) {
        mergedIdentifiers.push(newId);
      }
    }

    const updatedPatient: Patient = {
      ...existingPatient,
      ...newPatient,
      identifier: mergedIdentifiers,
      resourceType: 'Patient',
    };

    const result = await client.updateResource(updatedPatient);
    console.log(`Updated patient: ${result.id}`);
    return result;
  }

  private async createEncounterFromPV1(
    medplum: MedplumClient,
    message: Hl7Message,
    messageType: string,
    patientReference: string,
  ): Promise<Partial<Encounter>> {
    const pv1Segment = message.getSegment('PV1');
    if (!pv1Segment) {
      return {};
    }

    try {
      const patientClassField = pv1Segment.getField(2);
      let patientClassCode = 'AMB'; // default: Ambulatory

      if (patientClassField) {
        const hl7Class = patientClassField.toString();
        patientClassCode = mapHL7PatientClassToFHIR(hl7Class);
      }
      const encounter: Partial<Encounter> = {
        resourceType: 'Encounter',
        status: mapADTTypeToEncounterStatus(messageType),
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: patientClassCode,
          display: patientClassField?.toString() || 'ambulatory',
        },
        subject: {
          reference: patientReference,
        },
        serviceProvider: {
          reference: `Organization/${this.ORGANIZATION_ID}`,
          display: this.ORGANIZATION_NAME,
        },
      };
      let visitNumber = '';
      const visitNumberField = pv1Segment.getField(19);
      if (visitNumberField) {
        visitNumber = visitNumberField.toString();
      }

      if (!visitNumber) {
        const altVisitField = pv1Segment.getField(50);
        if (altVisitField) {
          visitNumber = altVisitField.toString();
        }
      }

      if (!visitNumber) {
        const altVisitField2 = pv1Segment.getField(51);
        if (altVisitField2) {
          visitNumber = altVisitField2.toString();
        }
      }

      if (visitNumber) {
        encounter.identifier = [
          {
            use: 'usual',
            system: `${this.ORGANIZATION_SYSTEM}/encounters`,
            value: visitNumber,
          },
        ];
      }

      const admitDateTimeField = pv1Segment.getField(44);
      const dischargeDateTimeField = pv1Segment.getField(45);

      const period: any = {};

      if (admitDateTimeField) {
        const admitDateTime = admitDateTimeField.toString();
        const formatted = formatHL7DateTime(admitDateTime);
        if (formatted) period.start = formatted;
      }

      if (dischargeDateTimeField) {
        const dischargeDateTime = dischargeDateTimeField.toString();
        const formatted = formatHL7DateTime(dischargeDateTime);
        if (formatted) period.end = formatted;
      }

      if (Object.keys(period).length > 0) {
        encounter.period = period;
      }

      const attendingDoctorField = pv1Segment.getField(7);
      if (attendingDoctorField) {
        const participants: any[] = [];

        for (let repetition = 0; repetition < 5; repetition++) {
          try {
            const doctorId = attendingDoctorField.getComponent(
              0,
              undefined,
              repetition,
            );
            if (!doctorId && repetition === 0) {
              const firstDoctorId = attendingDoctorField.getComponent(0);
              if (firstDoctorId) {
                const practitionerReference =
                  await this.createOrFindPractitioner(
                    medplum,
                    attendingDoctorField,
                  );
                if (practitionerReference) {
                  participants.push({
                    type: [
                      {
                        coding: [
                          {
                            system:
                              'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                            code: 'ATND',
                            display: 'attender',
                          },
                        ],
                      },
                    ],
                    individual: {
                      reference: practitionerReference,
                    },
                  });
                }
                break;
              }
            } else if (doctorId) {
              const tempField = {
                getComponent: (index: number) => {
                  return attendingDoctorField.getComponent(
                    index,
                    undefined,
                    repetition,
                  );
                },
              };

              const practitionerReference = await this.createOrFindPractitioner(
                medplum,
                tempField,
              );
              if (practitionerReference) {
                participants.push({
                  type: [
                    {
                      coding: [
                        {
                          system:
                            'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                          code: 'ATND',
                          display: 'attender',
                        },
                      ],
                    },
                  ],
                  individual: {
                    reference: practitionerReference,
                  },
                });
              }
            } else {
              break;
            }
          } catch {
            break;
          }
        }

        if (participants.length > 0) {
          encounter.participant = participants;
        }
      }

      return encounter;
    } catch (error) {
      console.log('Error creating encounter from PV1:', error);
      return {};
    }
  }

  // Create or find Practitioner from PV1.7 (Attending Doctor) with caching
  private async createOrFindPractitioner(
    medplum: MedplumClient,
    attendingDoctorField: any,
  ): Promise<string | undefined> {
    if (!attendingDoctorField) {
      return undefined;
    }

    try {
      // Clean expired cache entries periodically
      this.cleanPractitionerCache();

      const doctorId = attendingDoctorField.getComponent(0);
      const doctorLastName = attendingDoctorField.getComponent(1);
      const doctorFirstName = attendingDoctorField.getComponent(2);
      const doctorMiddleName = attendingDoctorField.getComponent(3);

      if (!doctorId && !doctorLastName) {
        return undefined;
      }

      // Create cache key based on available data
      const cacheKey = doctorId
        ? `id:${doctorId}`
        : `name:${doctorLastName}^${doctorFirstName}`;

      // Check cache first
      const cachedEntry = this.practitionerCache.get(cacheKey);
      if (cachedEntry) {
        console.log(
          `Found cached practitioner: ${cachedEntry.practitioner.id}`,
        );
        return `Practitioner/${cachedEntry.practitioner.id}`;
      }

      // Search for existing practitioner by ID or name
      let practitioner: Practitioner | undefined = undefined;

      if (doctorId) {
        practitioner = await medplum.searchOne(
          'Practitioner',
          `identifier=${this.ORGANIZATION_SYSTEM}/practitioners|${doctorId}`,
        );
      }

      if (!practitioner && doctorLastName) {
        practitioner = await medplum.searchOne(
          'Practitioner',
          `family=${doctorLastName}&given=${doctorFirstName}`,
        );
      }

      if (practitioner) {
        console.log(`Found existing practitioner: ${practitioner.id}`);

        // Cache the result
        this.practitionerCache.set(cacheKey, {
          practitioner,
          timestamp: Date.now(),
        });

        return `Practitioner/${practitioner.id}`;
      } else {
        // Create new practitioner - always add identifier to prevent duplicates
        const practitionerData: Partial<Practitioner> = {
          resourceType: 'Practitioner',
          name: [
            {
              use: 'official',
              family: doctorLastName,
              given: [doctorFirstName, doctorMiddleName].filter(Boolean),
            },
          ],
          identifier: [
            {
              use: 'usual',
              system: `${this.ORGANIZATION_SYSTEM}/practitioners`,
              value: doctorId || `${doctorLastName}^${doctorFirstName}`, // Use ID if available, otherwise name-based ID
            },
          ],
          active: true,
          // Link to organization
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/practitioner-organization',
              valueReference: {
                reference: `Organization/${this.ORGANIZATION_ID}`,
                display: this.ORGANIZATION_NAME,
              },
            },
          ],
        };

        const newPractitioner = await medplum.createResource(
          practitionerData as Practitioner,
        );
        console.log(`Created new practitioner: ${newPractitioner.id}`);

        // Cache the newly created practitioner
        this.practitionerCache.set(cacheKey, {
          practitioner: newPractitioner,
          timestamp: Date.now(),
        });

        return `Practitioner/${newPractitioner.id}`;
      }
    } catch (error) {
      console.log('Error creating/finding practitioner:', error);
      return undefined;
    }
  }
  private cleanPractitionerCache(): void {
    const now = Date.now();

    // Only clean cache if enough time has passed since last cleanup
    if (now - this.lastCacheCleanup < this.CACHE_CLEANUP_INTERVAL) {
      return;
    }

    this.lastCacheCleanup = now;
    let cleanedCount = 0;

    // Iterate through cache entries using forEach for better compatibility
    this.practitionerCache.forEach((entry, key) => {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.practitionerCache.delete(key);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`Cleaned ${cleanedCount} expired practitioner cache entries`);
    }
  }
  private async findEncounter(
    medplum: MedplumClient,
    encounter: Partial<Encounter>,
  ): Promise<Encounter | null> {
    let visitNumber: string | undefined;
    let encounterSystem: string | undefined;
    if (encounter.identifier && encounter.identifier.length > 0) {
      visitNumber = encounter.identifier[0].value;
      encounterSystem = encounter.identifier[0].system;
    }

    if (!visitNumber || !encounterSystem) {
      return null;
    }

    const existingEncounter = await medplum.searchOne(
      'Encounter',
      `identifier=${encounterSystem}|${visitNumber}`,
    );
    return existingEncounter ?? null;
  }

  private async updateExistingEncounter(
    newEncounter: Partial<Encounter>,
    medplum: MedplumClient,
    existingEncounter: Partial<Encounter>,
  ): Promise<Encounter | null> {
    const updatedEncounter = {
      ...existingEncounter,
      status: newEncounter.status ?? existingEncounter.status,
      period: newEncounter.period ?? existingEncounter.period,
      class: newEncounter.class ?? existingEncounter.class,
      serviceProvider:
        newEncounter.serviceProvider ?? existingEncounter.serviceProvider,
      identifier: [
        ...(existingEncounter.identifier || []),
        ...(newEncounter.identifier || []),
      ],
      participant: [
        ...(existingEncounter.participant || []),
        ...(newEncounter.participant || []),
      ],
    };

    return await medplum.updateResource(updatedEncounter as Encounter);
  }
}
