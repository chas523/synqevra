import { Hl7Message, Hl7Segment } from '@medplum/core';
import { Pv1ToEncounterMapper } from './pv1-to-encounter.mapper';
import { OrganizationConfig } from 'src/hl7/application/dto/organization-config.command';
import { Encounter, Patient } from '@medplum/fhirtypes';

describe('Pv1ToEncounterMapper', () => {
  let mapper: Pv1ToEncounterMapper;
  let mockMessage: jest.Mocked<Hl7Message>;
  let mockPv1Segment: jest.Mocked<Hl7Segment>;
  let organizationConfig: OrganizationConfig;
  let patient: Partial<Patient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mapper = new Pv1ToEncounterMapper();

    mockPv1Segment = {
      getField: jest.fn(),
    } as unknown as jest.Mocked<Hl7Segment>;

    mockMessage = {
      getSegment: jest.fn((name: string) => {
        if (name === 'PV1') return mockPv1Segment;
        return undefined;
      }),
    } as unknown as jest.Mocked<Hl7Message>;

    organizationConfig = {
      id: 'org-456',
      name: 'Test Clinic',
      system: 'http://test-clinic.org',
    };

    patient = {
      id: 'patient-123',
      resourceType: 'Patient',
    };
  });

  describe('map', () => {
    it('should return empty object when PV1 segment is missing', () => {
      mockMessage.getSegment.mockReturnValue(undefined);

      const result = mapper.map(
        mockMessage,
        'A01',
        patient,
        organizationConfig,
      );

      expect(result).toEqual({});
    });

    it('should map basic encounter fields', () => {
      mockPv1Segment.getField.mockImplementation((fieldNum: number) => {
        if (fieldNum === 2) {
          return { toString: () => 'I' } as any; // inpatient
        }
        if (fieldNum === 19) {
          return { toString: () => 'VISIT-999' } as any;
        }
        return undefined;
      });

      const result = mapper.map(
        mockMessage,
        'A01',
        patient,
        organizationConfig,
      );

      expect(result.encounter).toBeDefined();
      expect(result.encounter?.resourceType).toBe('Encounter');
      expect(result.encounter?.status).toBe('in-progress');
      expect(result.encounter?.subject).toEqual({
        reference: 'Patient/patient-123',
      });
      expect(result.encounter?.serviceProvider).toEqual({
        reference: 'Organization/org-456',
        display: 'Test Clinic',
      });
      expect(result.encounter?.identifier).toEqual([
        {
          use: 'usual',
          system: 'http://test-clinic.org/encounters',
          value: 'VISIT-999',
        },
      ]);
    });

    it('should map patient class to FHIR code', () => {
      mockPv1Segment.getField.mockImplementation((fieldNum: number) => {
        if (fieldNum === 2) {
          return { toString: () => 'E' } as any; // emergency
        }
        return undefined;
      });

      const result = mapper.map(
        mockMessage,
        'A01',
        patient,
        organizationConfig,
      );

      expect(result.encounter?.class).toEqual({
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'EMER',
        display: 'E',
      });
    });

    it('should map period with admit and discharge times', () => {
      mockPv1Segment.getField.mockImplementation((fieldNum: number) => {
        if (fieldNum === 44) {
          return { toString: () => '20230101120000' } as any;
        }
        if (fieldNum === 45) {
          return { toString: () => '20230102150000' } as any;
        }
        return undefined;
      });

      const result = mapper.map(
        mockMessage,
        'A03',
        patient,
        organizationConfig,
      );

      expect(result.encounter?.period).toBeDefined();
      expect(result.encounter?.period?.start).toBe('2023-01-01T12:00:00Z');
      expect(result.encounter?.period?.end).toBe('2023-01-02T15:00:00Z');
    });

    it('should extract attending doctor field when present', () => {
      const mockDoctorField = {
        getComponent: jest.fn((idx: number) => {
          if (idx === 1) return 'DOC123';
          if (idx === 2) return 'Smith';
          if (idx === 3) return 'John';
          return '';
        }),
      };

      mockPv1Segment.getField.mockImplementation((fieldNum: number) => {
        if (fieldNum === 7) return mockDoctorField as any;
        return undefined;
      });

      const result = mapper.map(
        mockMessage,
        'A01',
        patient,
        organizationConfig,
      );

      expect(result.attendingDoctorField).toBeDefined();
      expect(result.attendingDoctorField?.getComponent(1)).toBe('DOC123');
    });
  });

  describe('merge', () => {
    it('should merge new encounter data into existing encounter', () => {
      const existingEncounter: Encounter = {
        resourceType: 'Encounter',
        id: 'encounter-1',
        status: 'in-progress',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
        },
      };

      const newEncounter: Partial<Encounter> = {
        status: 'finished',
        period: {
          start: '2023-01-01T10:00:00Z',
          end: '2023-01-01T11:00:00Z',
        },
      };

      const result = mapper.merge(existingEncounter, newEncounter);

      expect(result.id).toBe('encounter-1'); // preserved
      expect(result.status).toBe('finished'); // updated
      expect(result.period).toEqual(newEncounter.period);
      expect(result.resourceType).toBe('Encounter');
    });
  });
});
