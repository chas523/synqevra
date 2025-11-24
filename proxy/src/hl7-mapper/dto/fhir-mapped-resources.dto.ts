import { Patient, Encounter, Practitioner } from '@medplum/fhirtypes';

export class FhirMappedResourcesDto {
  tenantId: string;
  messageType: string;
  rawMessage: string; // Original HL7 message for ACK generation
  patient?: Patient | Partial<Patient>;
  encounter?: Encounter | Partial<Encounter>;

  // Practitioners that need to be created (don't exist in Medplum yet)
  practitionersToCreate?: Array<Partial<Practitioner>>;

  // For A40 merge operations
  mergeOperation?: {
    newPatient: Patient | Partial<Patient>;
    oldPatientIdentifier: string;
  };

  // Flag to indicate if message was already processed
  alreadyProcessed: boolean;

  constructor(partial: Partial<FhirMappedResourcesDto>) {
    Object.assign(this, partial);
  }
}
