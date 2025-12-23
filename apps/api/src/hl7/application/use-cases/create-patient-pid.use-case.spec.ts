import { CreatePatientFromPidUseCase } from './create-patient-pid.use-case';
import { PidToPatientMapper } from '../../infrastructure/mappers/pid-to-patient.mapper';
import { MedplumClientPort } from '../../../medplum/application/ports/medplum-client.port';
import { Hl7Message } from '@medplum/core';
import { CreatePatientFromPidCommand } from '../dto/create-patient-from-pid.command';
import { Patient } from '@medplum/fhirtypes';
import { Logger } from '@nestjs/common';

describe('CreatePatientFromPidUseCase', () => {
  let useCase: CreatePatientFromPidUseCase;
  let mapper: jest.Mocked<PidToPatientMapper>;
  let medplumClient: jest.Mocked<MedplumClientPort>;

  beforeEach(() => {
    jest.clearAllMocks();

    mapper = {
      map: jest.fn(),
      mergePatientData: jest.fn(),
      mapMergeData: jest.fn(),
    } as unknown as jest.Mocked<PidToPatientMapper>;

    medplumClient = {
      findPatientByIdentifier: jest.fn(),
    } as unknown as jest.Mocked<MedplumClientPort>;

    useCase = new CreatePatientFromPidUseCase(mapper, medplumClient);
  });

  describe('execute', () => {
    const mockCommand: CreatePatientFromPidCommand = {
      message: {} as Hl7Message,
      organizationConfig: {
        id: 'org-1',
        name: 'Test Org',
        system: 'http://test.org',
      },
      tenantId: 'tenant-1',
    };

    it('should return new patient when no existing patient found', async () => {
      const mockPatientDraft: Partial<Patient> = {
        resourceType: 'Patient',
        identifier: [
          {
            system: 'http://test.org',
            value: '12345',
          },
        ],
        name: [{ family: 'Doe', given: ['John'] }],
      };

      mapper.map.mockReturnValue(mockPatientDraft);
      medplumClient.findPatientByIdentifier.mockResolvedValue(null);

      const result = await useCase.execute(mockCommand);

      expect(result.patient).toEqual(mockPatientDraft);
      expect(result.mergeFromIdentifier).toBeUndefined();
      expect(medplumClient.findPatientByIdentifier).toHaveBeenCalledWith(
        {
          system: 'http://test.org',
          value: '12345',
        },
        undefined,
        'tenant-1',
      );
      expect(mapper.mergePatientData).not.toHaveBeenCalled();
    });

    it('should return new patient when draft has no identifiers', async () => {
      const mockPatientDraft: Partial<Patient> = {
        resourceType: 'Patient',
        identifier: [],
        name: [{ family: 'NoId' }],
      };

      mapper.map.mockReturnValue(mockPatientDraft);

      const result = await useCase.execute(mockCommand);

      expect(result.patient).toEqual(mockPatientDraft);
      expect(medplumClient.findPatientByIdentifier).not.toHaveBeenCalled();
    });

    it('should merge with existing patient when found', async () => {
      const mockPatientDraft: Partial<Patient> = {
        resourceType: 'Patient',
        identifier: [
          {
            system: 'http://test.org',
            value: '67890',
          },
        ],
        name: [{ family: 'Smith', given: ['Jane'] }],
      };
      const mockExistingPatient: Patient = {
        id: 'existing-patient-1',
        resourceType: 'Patient',
        identifier: [
          {
            system: 'http://test.org',
            value: '67890',
          },
        ],
        name: [{ family: 'Smith', given: ['J'] }],
      };
      const mockMergedPatient: Patient = {
        ...mockExistingPatient,
        ...mockPatientDraft,
        id: 'existing-patient-1',
      } as Patient;

      mapper.map.mockReturnValue(mockPatientDraft);
      medplumClient.findPatientByIdentifier.mockResolvedValue(
        mockExistingPatient,
      );
      mapper.mergePatientData.mockReturnValue(mockMergedPatient);

      const result = await useCase.execute(mockCommand);

      expect(result.patient).toEqual(mockMergedPatient);
      expect(mapper.mergePatientData).toHaveBeenCalledWith(
        mockExistingPatient,
        mockPatientDraft,
      );
      expect(medplumClient.findPatientByIdentifier).toHaveBeenCalledTimes(1);
    });

    it('should return new patient when findPatientByIdentifier throws error', async () => {
      const mockPatientDraft: Partial<Patient> = {
        resourceType: 'Patient',
        identifier: [
          {
            system: 'http://test.org',
            value: 'error-case',
          },
        ],
      };

      // silence error logging for this test
      jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

      mapper.map.mockReturnValue(mockPatientDraft);
      medplumClient.findPatientByIdentifier.mockRejectedValue(
        new Error('Network error'),
      );

      const result = await useCase.execute(mockCommand);

      expect(result.patient).toEqual(mockPatientDraft);
      expect(mapper.mergePatientData).not.toHaveBeenCalled();
    });
  });

  describe('executeMerge', () => {
    const mockCommand: CreatePatientFromPidCommand = {
      message: {} as Hl7Message,
      organizationConfig: {
        id: 'org-2',
        name: 'Merge Org',
        system: 'http://merge.org',
      },
      tenantId: 'tenant-2',
    };

    it('should return merge result with old identifier', () => {
      const mockMergeData = {
        newPatient: {
          resourceType: 'Patient',
          identifier: [{ system: 'http://merge.org', value: 'NEW-123' }],
        } as Partial<Patient>,
        oldPatientIdentifier: 'OLD-456',
      };

      mapper.mapMergeData.mockReturnValue(mockMergeData);

      const result = useCase.executeMerge(mockCommand);

      expect(result.patient).toEqual(mockMergeData.newPatient);
      expect(result.mergeFromIdentifier).toBe('OLD-456');
      expect(mapper.mapMergeData).toHaveBeenCalledWith(
        mockCommand.message,
        mockCommand.organizationConfig,
      );
    });

    it('should handle merge data with no old identifier', () => {
      const mockMergeData = {
        newPatient: {
          resourceType: 'Patient',
          identifier: [{ system: 'http://merge.org', value: 'ONLY-NEW' }],
        } as Partial<Patient>,
        oldPatientIdentifier: '',
      };

      mapper.mapMergeData.mockReturnValue(mockMergeData);

      const result = useCase.executeMerge(mockCommand);

      expect(result.patient).toEqual(mockMergeData.newPatient);
      expect(result.mergeFromIdentifier).toBe('');
    });
  });
});
