import { proxyApi } from "@/lib/api/api";
import { extractErrorMessage } from "@/lib/utils";

export interface TenantAlarmDto {
  id: string;
  tenantId: string;
  deviceId: string;
  alarmType: string;
  status: "OPEN_UNACK" | "OPEN_ACK" | "RESOLVED";
  lastEventId: string;
  currentValue: Record<string, unknown>;
  thresholdSnapshot: Record<string, unknown>;
  suppressed: boolean;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantAlarmPageDto {
  data: TenantAlarmDto[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

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

export class AlarmService {
  public static async getCurrentTenantAlarms(
    page = 0,
    pageSize = 50,
  ): Promise<TenantAlarmPageDto> {
    try {
      const response = await proxyApi.get<TenantAlarmPageDto>(
        `/alarm/tenant?page=${page}&pageSize=${pageSize}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Failed to fetch tenant alarms");
      throw new Error(message);
    }
  }

  public static async getAlarmHistory(
    alarmId: string,
    limit = 100,
  ): Promise<AlarmHistoryResponseDto> {
    try {
      const response = await proxyApi.get<AlarmHistoryResponseDto>(
        `/alarm/tenant/${alarmId}/history?limit=${limit}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Failed to fetch alarm history");
      throw new Error(message);
    }
  }

  public static async updateCurrentTenantAlarmStatus(
    alarmId: string,
    status: TenantAlarmDto["status"],
  ): Promise<TenantAlarmDto> {
    try {
      const response = await proxyApi.patch<TenantAlarmDto>(
        `/alarm/tenant/${alarmId}/status`,
        {
          status,
        },
      );

      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Failed to update alarm status");
      throw new Error(message);
    }
  }
}
