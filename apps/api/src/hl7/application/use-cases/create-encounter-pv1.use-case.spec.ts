import { CreateEncounterPv1UseCase } from './create-encounter-pv1.use-case';
import { Pv1ToEncounterMapper } from '../../infrastructure/mappers/pv1-to-encounter.mapper';
import { PractitionerLookupService } from '../services/practitioner-lookup.service';
import { MedplumClientPort } from '../../../medplum/application/ports/medplum-client.port';
import { EncounterFromPv1Command } from '../dto/encounter-from-pv1.command';
import { Hl7Message } from '@medplum/core';
import { Encounter, Practitioner } from '@medplum/fhirtypes';

describe('CreateEncounterPv1UseCase', () => {
  let useCase: CreateEncounterPv1UseCase;
  let mapper: jest.Mocked<Pv1ToEncounterMapper>;
  let lookupService: jest.Mocked<PractitionerLookupService>;
  let medplumClient: MedplumClientPort;

  beforeEach(() => {
    jest.clearAllMocks();

    mapper = {
      map: jest.fn(),
      merge: jest.fn(),
    } as unknown as jest.Mocked<Pv1ToEncounterMapper>;

    lookupService = {
      handle: jest.fn(),
    } as unknown as jest.Mocked<PractitionerLookupService>;

    medplumClient = {
      findExistingEncounter: jest.fn(),
    } as unknown as jest.Mocked<MedplumClientPort>;

    useCase = new CreateEncounterPv1UseCase(
      mapper,
      lookupService,
      medplumClient,
    );
  });

  describe('execute', () => {
    const command: EncounterFromPv1Command = {
      message: {} as Hl7Message,
      messageType: 'A01',
      patient: {
        id: 'patient-123',
        resourceType: 'Patient',
      },
      organizationConfig: {
        id: 'org-1',
        name: 'Test Org',
        system: 'http://test.org',
      },
      tenantId: 'tenant-1',
    };
    const mockNewEncounter: Partial<Encounter> = {
      resourceType: 'Encounter',
      status: 'in-progress',
      identifier: [{ value: 'ENC-002' }],
    };

    it('should return empty object when no PV1 found', async () => {
      jest.spyOn(mapper, 'map').mockReturnValue({});
      const result = await useCase.execute(command);

      expect(result).toEqual({});
      expect(mapper.map).toHaveBeenCalledWith(
        command.message,
        command.messageType,
        command.patient,
        command.organizationConfig,
      );
      expect(lookupService.handle).not.toHaveBeenCalled();
      expect(medplumClient.findExistingEncounter).not.toHaveBeenCalled();
    });

    it('should create encounter when mapped encounter is returned', async () => {
      jest.spyOn(mapper, 'map').mockReturnValue({
        encounter: mockNewEncounter,
        attendingDoctorField: undefined,
      });
      jest.spyOn(lookupService, 'handle').mockResolvedValue({});

      const result = await useCase.execute(command);

      expect(result).toEqual({
        // existingEncounter is undefined so merge is not used and returns encounter as is
        encounter: mockNewEncounter,
        practitionersToCreate: undefined,
      });
      expect(mapper.map).toHaveBeenCalledWith(
        command.message,
        command.messageType,
        command.patient,
        command.organizationConfig,
      );
      expect(lookupService.handle).toHaveBeenCalledWith(
        undefined,
        command.tenantId,
        command.organizationConfig.system,
      );
    });

    it('should merge existing encounter when found', async () => {
      const mockExistingEncounter: Encounter = {
        id: 'existing-enc-1',
        resourceType: 'Encounter',
        status: 'arrived',
        class: { code: 'ENC' },
      };
      const mockMergedEncounter: Encounter = {
        ...mockExistingEncounter,
        ...mockNewEncounter,
        id: 'existing-enc-1',
      } as Encounter;

      jest.spyOn(mapper, 'map').mockReturnValue({
        encounter: mockNewEncounter,
        attendingDoctorField: undefined,
      });
      jest.spyOn(mapper, 'merge').mockReturnValue(mockMergedEncounter);
      jest.spyOn(lookupService, 'handle').mockResolvedValue({});
      jest
        .spyOn(medplumClient, 'findExistingEncounter')
        .mockResolvedValue(mockExistingEncounter);

      const result = await useCase.execute(command);

      expect(mapper.merge).toHaveBeenCalledWith(
        mockExistingEncounter,
        mockNewEncounter,
      );
      expect(result.encounter).toEqual(mockMergedEncounter);
      expect(result.encounter?.id).toBe('existing-enc-1');
    });

    it('should return practitioners to create', async () => {
      const mockPractitionerToCreate: Partial<Practitioner> = {
        resourceType: 'Practitioner',
        name: [{ family: 'Smith', given: ['John'] }],
      };

      jest.spyOn(mapper, 'map').mockReturnValue({
        encounter: mockNewEncounter,
        attendingDoctorField: { getComponent: jest.fn() },
      });
      jest.spyOn(lookupService, 'handle').mockResolvedValue({
        practitionerToCreate: mockPractitionerToCreate,
      });
      jest
        .spyOn(medplumClient, 'findExistingEncounter')
        .mockResolvedValue(null);

      const result = await useCase.execute(command);

      expect(result.practitionersToCreate).toEqual([mockPractitionerToCreate]);
      expect(result.encounter?.participant).toBeUndefined();
    });
  });
});
