import { PractitionerLookupService } from './practitioner-lookup.service';
import { MedplumClientPort } from '../../../medplum/application/ports/medplum-client.port';
import { Cache } from 'cache-manager';
import { Practitioner } from '@medplum/fhirtypes';
import { AttendingDoctorField } from '../../infrastructure/types/hl7-mapper.types';

describe('PractitionerLookupService', () => {
  let service: PractitionerLookupService;
  let medplumClient: jest.Mocked<MedplumClientPort>;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(() => {
    jest.clearAllMocks();

    medplumClient = {
      findPractitionerById: jest.fn(),
      findPractitionerBySurname: jest.fn(),
    } as unknown as jest.Mocked<MedplumClientPort>;

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as jest.Mocked<Cache>;

    service = new PractitionerLookupService(medplumClient, cacheManager);
  });

  describe('handle', () => {
    const tenantId = 'tenant-123';
    const organizationSystem = 'http://example.org/org';

    it('should return empty object when attendingDoctorField is undefined', async () => {
      const result = await service.handle(
        undefined,
        tenantId,
        organizationSystem,
      );

      expect(result).toEqual({});
      expect(medplumClient.findPractitionerById).not.toHaveBeenCalled();
      expect(medplumClient.findPractitionerBySurname).not.toHaveBeenCalled();
    });

    it('should return empty object when both doctorId and doctorLastName are missing', async () => {
      const mockField = {
        getComponent: jest.fn((index: number) => {
          if (index === 1) return ''; // doctorId
          if (index === 2) return ''; // doctorLastName
          if (index === 3) return ''; // doctorFirstName
          return '';
        }),
      } as unknown as AttendingDoctorField;

      const result = await service.handle(
        mockField,
        tenantId,
        organizationSystem,
      );

      expect(result).toEqual({});
      expect(medplumClient.findPractitionerById).not.toHaveBeenCalled();
    });

    it('should return cached practitioner when found in cache', async () => {
      const mockField = {
        getComponent: jest.fn((index: number) => {
          if (index === 1) return 'DOC123';
          if (index === 2) return 'Smith';
          if (index === 3) return 'John';
          return '';
        }),
      } as unknown as AttendingDoctorField;

      const cachedPractitioner: Practitioner = {
        resourceType: 'Practitioner',
        id: 'cached-practitioner-id',
      };

      cacheManager.get.mockResolvedValue({ practitioner: cachedPractitioner });

      const result = await service.handle(
        mockField,
        tenantId,
        organizationSystem,
      );

      expect(result).toEqual({
        reference: 'Practitioner/cached-practitioner-id',
      });
      expect(cacheManager.get).toHaveBeenCalledWith('practitioner:id:DOC123');
      expect(medplumClient.findPractitionerById).not.toHaveBeenCalled();
    });

    it('should find practitioner by id and cache it', async () => {
      const mockField = {
        getComponent: jest.fn((index: number) => {
          if (index === 1) return 'DOC456';
          if (index === 2) return 'Doe';
          if (index === 3) return 'Jane';
          return '';
        }),
      } as unknown as AttendingDoctorField;

      const foundPractitioner: Practitioner = {
        resourceType: 'Practitioner',
        id: 'found-by-id',
      };

      cacheManager.get.mockResolvedValue(null);
      medplumClient.findPractitionerById.mockResolvedValue(foundPractitioner);

      const result = await service.handle(
        mockField,
        tenantId,
        organizationSystem,
      );

      expect(result).toEqual({ reference: 'Practitioner/found-by-id' });
      expect(medplumClient.findPractitionerById).toHaveBeenCalledWith(
        'DOC456',
        undefined,
        tenantId,
      );
      expect(cacheManager.set).toHaveBeenCalledWith(
        'practitioner:id:DOC456',
        { practitioner: foundPractitioner },
        expect.any(Number),
      );
    });

    it('should find practitioner by surname when id search fails', async () => {
      const mockField = {
        getComponent: jest.fn((index: number) => {
          if (index === 1) return 'DOC789';
          if (index === 2) return 'Brown';
          if (index === 3) return 'Charlie';
          return '';
        }),
      } as unknown as AttendingDoctorField;

      const foundPractitioner: Practitioner = {
        resourceType: 'Practitioner',
        id: 'found-by-surname',
      };

      cacheManager.get.mockResolvedValue(null);
      medplumClient.findPractitionerById.mockResolvedValue(null);
      medplumClient.findPractitionerBySurname.mockResolvedValue(
        foundPractitioner,
      );

      const result = await service.handle(
        mockField,
        tenantId,
        organizationSystem,
      );

      expect(result).toEqual({ reference: 'Practitioner/found-by-surname' });
      expect(medplumClient.findPractitionerById).toHaveBeenCalledWith(
        'DOC789',
        undefined,
        tenantId,
      );
      expect(medplumClient.findPractitionerBySurname).toHaveBeenCalledWith(
        'Brown',
        undefined,
        tenantId,
      );
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should return practitionerToCreate when practitioner not found', async () => {
      const mockField = {
        getComponent: jest.fn((index: number) => {
          if (index === 1) return 'NEW123';
          if (index === 2) return 'NewDoc';
          if (index === 3) return 'First';
          return '';
        }),
      } as unknown as AttendingDoctorField;

      cacheManager.get.mockResolvedValue(null);
      medplumClient.findPractitionerById.mockResolvedValue(null);
      medplumClient.findPractitionerBySurname.mockResolvedValue(null);

      const result = await service.handle(
        mockField,
        tenantId,
        organizationSystem,
      );

      expect(result).toHaveProperty('practitionerToCreate');
      expect(result.practitionerToCreate).toMatchObject({
        resourceType: 'Practitioner',
        identifier: [
          {
            system: organizationSystem,
            value: 'NEW123',
          },
        ],
        name: [
          {
            use: 'official',
            family: 'NewDoc',
            given: ['First'],
          },
        ],
      });
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should return empty object when error occurs', async () => {
      const mockField = {
        getComponent: jest.fn(() => {
          throw new Error('Field parsing error');
        }),
      } as unknown as AttendingDoctorField;

      const result = await service.handle(
        mockField,
        tenantId,
        organizationSystem,
      );

      expect(result).toEqual({});
    });

    it('should handle practitioner with surname only', async () => {
      const mockField = {
        getComponent: jest.fn((index: number) => {
          if (index === 1) return '';
          if (index === 2) return 'OnlySurname';
          if (index === 3) return '';
          return '';
        }),
      } as unknown as AttendingDoctorField;

      cacheManager.get.mockResolvedValue(null);
      medplumClient.findPractitionerBySurname.mockResolvedValue(null);

      const result = await service.handle(
        mockField,
        tenantId,
        organizationSystem,
      );

      expect(result.practitionerToCreate).toMatchObject({
        name: [
          {
            use: 'official',
            family: 'OnlySurname',
            given: [],
          },
        ],
        identifier: undefined,
      });
    });
  });
});
