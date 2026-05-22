import { AlarmStatus } from '../../domain/enums/alarm-status.enum';

export interface TenantAlarmResponseDto {
  id: string;
  tenantId: string;
  deviceId: string;
  alarmType: string;
  status: AlarmStatus;
  lastEventId: string;
  currentValue: Record<string, unknown>;
  thresholdSnapshot: Record<string, unknown>;
  suppressed: boolean;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantAlarmsPageResponseDto {
  data: TenantAlarmResponseDto[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}
