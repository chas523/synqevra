export interface AlarmHistoryItemDto {
  outboxId: string;
  eventId: string;
  alarmType: string;
  status?: string;
  timestamp: string;
  createdAt: string;
  telemetry: Record<string, unknown>;
  thresholdSnapshot: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface AlarmHistoryResponseDto {
  alarmId: string;
  items: AlarmHistoryItemDto[];
}
