import { Hl7Message, Hl7Segment } from '@medplum/core';
import { PidToPatientMapper } from './pid-to-patient.mapper';
import { OrganizationConfig } from '../../application/dto/organization-config.command';
import { Hl7ParsingError } from '../../interface/pipes/hl7-to-fhir-pipe';
import { Patient } from '@medplum/fhirtypes';

describe('PidToPatientMapper', () => {
  let mapper: PidToPatientMapper;
  let mockMessage: jest.Mocked<Hl7Message>;
  let mockPidSegment: jest.Mocked<Hl7Segment>;
  let organizationConfig: OrganizationConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    mapper = new PidToPatientMapper();

    mockPidSegment = {
      getField: jest.fn(),
    } as unknown as jest.Mocked<Hl7Segment>;

    mockMessage = {
      getSegment: jest.fn((name: string) => {
        if (name === 'PID') return mockPidSegment;
        return undefined;
      }),
    } as unknown as jest.Mocked<Hl7Message>;

    organizationConfig = {
      id: 'org-123',
      name: 'Test Hospital',
      system: 'http://test-hospital.org',
    };
  });

  describe('map', () => {
    it('should throw Hl7ParsingError when PID segment is missing', () => {
      mockMessage.getSegment.mockReturnValue(undefined);

      expect(() => mapper.map(mockMessage, organizationConfig)).toThrow(
        Hl7ParsingError,
      );
      expect(() => mapper.map(mockMessage, organizationConfig)).toThrow(
        'Missing required PID segment',
      );
    });

    it('should map basic patient fields successfully', () => {
      mockPidSegment.getField.mockImplementation((fieldNum: number) => {
        if (fieldNum === 3) {
          return {
            toString: () => '12345^MRN',
            split: jest.fn(),
          } as any;
        }
        if (fieldNum === 5) {
          return {
            getComponent: (idx: number) => {
              if (idx === 1) return 'Doe';
              if (idx === 2) return 'John';
              if (idx === 3) return 'M';
              return '';
            },
          } as any;
        }
        if (fieldNum === 7) {
          return { toString: () => '19900101' } as any;
        }
        if (fieldNum === 8) {
          return { toString: () => 'M' } as any;
        }
        return undefined;
      });

      const result = mapper.map(mockMessage, organizationConfig);

      expect(result.resourceType).toBe('Patient');
      expect(result.managingOrganization).toEqual({
        reference: 'Organization/org-123',
        display: 'Test Hospital',
      });
      expect(result.name).toEqual([
        {
          use: 'official',
          family: 'Doe',
          given: ['John', 'M'],
        },
      ]);
      expect(result.birthDate).toBe('1990-01-01');
      expect(result.gender).toBe('male');
    });

    it('should map patient identifier with system', () => {
      mockPidSegment.getField.mockImplementation((fieldNum: number) => {
        if (fieldNum === 3) {
          return {
            toString: () => '98765^^^TEST_SYSTEM^MR',
            split: jest.fn(),
          } as any;
        }
        return undefined;
      });

      const result = mapper.map(mockMessage, organizationConfig);

      expect(result.identifier).toEqual([
        {
          use: 'usual',
          system: expect.any(String),
          value: '98765',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'MR',
              },
            ],
          },
        },
      ]);
    });
  });

  describe('mapMergeData', () => {
    it('should extract merge identifiers from PID and MRG segments', () => {
      const mockMrgSegment = {
        getField: jest.fn((fieldNum: number) => {
          if (fieldNum === 1) return { toString: () => 'OLD-123' };
          return undefined;
        }),
      };

      mockMessage.getSegment.mockImplementation((name: string) => {
        if (name === 'PID') return mockPidSegment;
        if (name === 'MRG') return mockMrgSegment as any;
        return undefined;
      });

      mockPidSegment.getField.mockImplementation((fieldNum: number) => {
        if (fieldNum === 3) {
          return { toString: () => 'NEW-456' } as any;
        }
        return undefined;
      });

      const result = mapper.mapMergeData(mockMessage, organizationConfig);

      expect(result.oldPatientIdentifier).toBe('OLD-123');
      expect(result.newPatient.resourceType).toBe('Patient');
    });

    it('should throw when merge identifiers are missing', () => {
      mockMessage.getSegment.mockReturnValue(undefined);

      expect(() =>
        mapper.mapMergeData(mockMessage, organizationConfig),
      ).toThrow(Hl7ParsingError);
      expect(() =>
        mapper.mapMergeData(mockMessage, organizationConfig),
      ).toThrow('Missing patient identifiers for merge operation');
    });
  });

  describe('mergePatientData', () => {
    it('should merge identifiers without duplicates', () => {
      const existingPatient: Patient = {
        resourceType: 'Patient',
        id: 'patient-1',
        identifier: [
          {
            system: 'http://hospital.org',
            value: '12345',
          },
        ],
      };

      const newPatient: Partial<Patient> = {
        identifier: [
          {
            system: 'http://hospital.org',
            value: '12345', // duplicate
          },
          {
            system: 'http://other.org',
            value: '67890', // new
          },
        ],
      };

      const result = mapper.mergePatientData(existingPatient, newPatient);

      expect(result.identifier).toHaveLength(2);
      expect(result.identifier).toContainEqual({
        system: 'http://hospital.org',
        value: '12345',
      });
      expect(result.identifier).toContainEqual({
        system: 'http://other.org',
        value: '67890',
      });
    });

    it('should overwrite existing patient fields with new data', () => {
      const existingPatient: Patient = {
        resourceType: 'Patient',
        id: 'patient-1',
        name: [{ family: 'OldName' }],
        gender: 'male',
      };

      const newPatient: Partial<Patient> = {
        name: [{ family: 'NewName' }],
        birthDate: '2000-01-01',
      };

      const result = mapper.mergePatientData(existingPatient, newPatient);

      expect(result.id).toBe('patient-1');
      expect(result.name).toEqual([{ family: 'NewName' }]);
      expect(result.birthDate).toBe('2000-01-01');
      expect(result.gender).toBe('male'); // preserved
    });
  });
});
