export interface NormalizedAlarmEventPayload {
  eventId: string;
  tenantId: string;
  deviceId: string;
  alarmType: string;
  data: Record<string, unknown>;
  thresholdSnapshot: Record<string, unknown>;
  ts: string;
  metadata: Record<string, unknown>;
}
