import { CODING_MAP, UNIT_MAP } from './measurement-definitions';
import { TelemetryObservationFactory } from './telemetry-aggregate';

describe('TelemetryObservationFactory', () => {
  const coding = CODING_MAP['heart_rate'];
  const unit = UNIT_MAP['heart_rate'];

  it('should create observation with valueQuantity when unit is provided', () => {
    const observation = TelemetryObservationFactory.createObservation({
      coding,
      patientRef: 'Patient/123',
      medplumDeviceId: 'medplum-1',
      tbDeviceId: 'tb-1',
      value: 75,
      unit,
    });

    expect(observation.resourceType).toBe('Observation');
    expect(observation.valueQuantity).toEqual({
      value: 75,
      unit: unit.unit,
      system: unit.system,
      code: unit.code,
    });
  });

  it('should create observation with valueString when unit is undefined', () => {
    const observation = TelemetryObservationFactory.createObservation({
      coding,
      patientRef: 'Patient/123',
      medplumDeviceId: 'dev-1',
      tbDeviceId: 'tb-1',
      value: 42,
      unit: undefined,
    });

    expect(observation.valueQuantity).toBeUndefined();
    expect(observation.valueString).toBe('42');
  });

  it('should generate timestamp if not provided', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-11-18T14:52:21.953Z'));

    const observation = TelemetryObservationFactory.createObservation({
      coding,
      patientRef: 'Patient/123',
      medplumDeviceId: 'dev-1',
      tbDeviceId: 'tb-1',
      value: 42,
      unit,
    });

    expect(observation.effectiveDateTime).toEqual('2025-11-18T14:52:21.953Z');

    jest.useRealTimers();
  });

  it('should use timestamp if provided', () => {
    const timestamp = '2024-06-01T12:00:00Z';
    const observation = TelemetryObservationFactory.createObservation({
      coding,
      patientRef: 'Patient/123',
      medplumDeviceId: 'dev-1',
      tbDeviceId: 'tb-1',
      value: 42,
      unit,
      timestamp: timestamp,
    });

    expect(observation.effectiveDateTime).toEqual(timestamp);
  });
});
