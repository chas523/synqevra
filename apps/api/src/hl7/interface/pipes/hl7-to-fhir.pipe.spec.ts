import type { Cache } from 'cache-manager';
import { Hl7ParsingError, HL7ToFHIRPipe } from './hl7-to-fhir-pipe';
import type { Patient, Encounter, Practitioner } from '@medplum/fhirtypes';
import { CreateEncounterPv1UseCase } from 'src/hl7/application/use-cases/create-encounter-pv1.use-case';
import { CreatePatientFromPidUseCase } from 'src/hl7/application/use-cases/create-patient-pid.use-case';
import { Hl7MessageDto } from '../../application/dto/hl7-message.dto';
import { Hl7Message } from '@medplum/core';
import { getMessageType } from '../../infrastructure/utils/hl7-mapping.utils';
import { CACHE_CONFIG } from '../../infrastructure/constants/cache.constants';

jest.mock('@medplum/core', () => ({
  Hl7Message: {
    parse: jest.fn(),
  },
}));

jest.mock('../../infrastructure/utils/hl7-mapping.utils', () => ({
  getMessageType: jest.fn(),
}));

describe('HL7ToFHIRPipe', () => {
  let pipe: HL7ToFHIRPipe;
  let createEncounterUseCase: jest.Mocked<CreateEncounterPv1UseCase>;
  let createPatientUseCase: jest.Mocked<CreatePatientFromPidUseCase>;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(() => {
    jest.clearAllMocks();

    createEncounterUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateEncounterPv1UseCase>;

    createPatientUseCase = {
      execute: jest.fn(),
      executeMerge: jest.fn(),
    } as unknown as jest.Mocked<CreatePatientFromPidUseCase>;

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as jest.Mocked<Cache>;

    pipe = new HL7ToFHIRPipe(
      createEncounterUseCase,
      createPatientUseCase,
      cacheManager,
    );
  });

  describe('transform', () => {
    const mockRawMessage = 'MSH|^~\\&|TEST|... ';
    const mockDto: Hl7MessageDto = {
      rawMessage: mockRawMessage,
      tenantId: 'tenant-123',
    };

    it('should return alreadyProcessed=true when message was already processed', async () => {
      const mockHl7Message = {
        getSegment: jest.fn((name: string) => {
          if (name === 'MSH') {
            return {
              getField: jest.fn((fieldNum: number) => {
                if (fieldNum === 10) {
                  return { toString: () => 'CTRL-001' };
                }
                return undefined;
              }),
            };
          }
          return undefined;
        }),
      };

      (Hl7Message.parse as jest.Mock).mockReturnValue(mockHl7Message);
      (getMessageType as jest.Mock).mockReturnValue('A01');
      cacheManager.get.mockResolvedValue(true);

      const result = await pipe.transform(mockDto);

      expect(result.alreadyProcessed).toBe(true);
      expect(result.messageType).toBe('A01');
      expect(result.tenantId).toBe('tenant-123');
      expect(createPatientUseCase.execute).not.toHaveBeenCalled();
      expect(createEncounterUseCase.execute).not.toHaveBeenCalled();
    });

    it('should process A40 merge message and return merge operation', async () => {
      const mockHl7Message = {
        getSegment: jest.fn((name: string) => {
          if (name === 'MSH') {
            return {
              getField: jest.fn((fieldNum: number) => {
                if (fieldNum === 10) {
                  return { toString: () => 'CTRL-002' };
                }
                return undefined;
              }),
            };
          }
          return undefined;
        }),
      };

      (Hl7Message.parse as jest.Mock).mockReturnValue(mockHl7Message);
      (getMessageType as jest.Mock).mockReturnValue('A40');
      cacheManager.get.mockResolvedValue(null);

      const mockMergeData = {
        patient: {
          resourceType: 'Patient',
          identifier: [{ value: 'NEW-123' }],
        } as Partial<Patient>,
        mergeFromIdentifier: 'OLD-456',
      };

      createPatientUseCase.executeMerge.mockReturnValue(mockMergeData);

      const result = await pipe.transform(mockDto);

      expect(result.alreadyProcessed).toBe(false);
      expect(result.messageType).toBe('A40');
      expect(result.mergeOperation).toEqual({
        newPatient: mockMergeData.patient,
        oldPatientIdentifier: 'OLD-456',
      });
      expect(createPatientUseCase.executeMerge).toHaveBeenCalledWith({
        message: mockHl7Message,
        tenantId: 'tenant-123',
        organizationConfig: {
          id: 'orgid',
          name: 'organization name',
          system: 'org-system',
        },
      });
      expect(createPatientUseCase.execute).not.toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        // ':' is included in the key as per CACHE_CONFIG
        `${CACHE_CONFIG.KEYS.PROCESSED_MESSAGE_PREFIX}CTRL-002`,
        true,
        expect.any(Number),
      );
    });

    it('should process ADT message with patient and encounter', async () => {
      const mockHl7Message = {
        getSegment: jest.fn((name: string) => {
          if (name === 'MSH') {
            return {
              getField: jest.fn((fieldNum: number) => {
                if (fieldNum === 10) {
                  return { toString: () => 'CTRL-003' };
                }
                return undefined;
              }),
            };
          }
          return undefined;
        }),
      };

      (Hl7Message.parse as jest.Mock).mockReturnValue(mockHl7Message);
      (getMessageType as jest.Mock).mockReturnValue('A01');
      cacheManager.get.mockResolvedValue(null);

      const mockPatient: Partial<Patient> = {
        id: 'patient-789',
        resourceType: 'Patient',
        identifier: [{ value: 'PAT-123' }],
      };

      const mockEncounter: Partial<Encounter> = {
        id: 'encounter-999',
        resourceType: 'Encounter',
        status: 'in-progress',
      };

      const mockPractitionersToCreate: Partial<Practitioner>[] = [
        {
          resourceType: 'Practitioner',
          name: [{ family: 'Smith' }],
        },
      ];

      createPatientUseCase.execute.mockResolvedValue({
        patient: mockPatient,
      });

      createEncounterUseCase.execute.mockResolvedValue({
        encounter: mockEncounter,
        practitionersToCreate: mockPractitionersToCreate,
      });

      const result = await pipe.transform(mockDto);

      expect(result.alreadyProcessed).toBe(false);
      expect(result.messageType).toBe('A01');
      expect(result.patient).toEqual(mockPatient);
      expect(result.encounter).toEqual(mockEncounter);
      expect(result.practitionersToCreate).toEqual(mockPractitionersToCreate);

      expect(createPatientUseCase.execute).toHaveBeenCalledWith({
        message: mockHl7Message,
        tenantId: 'tenant-123',
        organizationConfig: {
          id: 'orgid',
          name: 'organization name',
          system: 'org-system',
        },
      });

      expect(createEncounterUseCase.execute).toHaveBeenCalledWith({
        message: mockHl7Message,
        messageType: 'A01',
        tenantId: 'tenant-123',
        patient: mockPatient,
        organizationConfig: {
          id: 'orgid',
          name: 'organization name',
          system: 'org-system',
        },
      });
    });

    it('should throw Hl7ParsingError when parsing fails', async () => {
      (Hl7Message.parse as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid HL7 format');
      });

      await expect(pipe.transform(mockDto)).rejects.toThrow(Hl7ParsingError);
      await expect(pipe.transform(mockDto)).rejects.toThrow(
        'Invalid HL7 format',
      );
    });
  });
});
