export interface AlarmStreamEvent {
  schemaVersion: 1;
  alarmId: string;
  tenantId: string;
  deviceId: string;
  alarmType: string;
  status?: string;
  currentValue: Record<string, unknown>;
  thresholdSnapshot: Record<string, unknown>;
  eventId: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}
