import { Injectable, Logger } from '@nestjs/common';
import {
  TelemetryResponse,
  EntityType,
} from '../../interface/websocket/types/telemetry.types';

export interface EntityCountData {
  type: EntityType;
  count: number;
}

export interface SystemMetricsData {
  time: string;
  cpu: number;
  ram: number;
  disk: number;
}

export interface MsgCount {
  time: string;
  value: number;
}

/**
 * Service for parsing raw ThingsBoard WebSocket responses
 * into frontend-friendly formats.
 */
@Injectable()
export class TelemetryParserService {
  private readonly logger = new Logger(TelemetryParserService.name);

  private readonly CMD_ID_TO_ENTITY_TYPE: Record<number, EntityType> = {
    3: 'TENANT',
    5: 'DEVICE',
    7: 'USER',
  };

  parseEntityCount(response: TelemetryResponse): EntityCountData | null {
    try {
      const entityType = this.CMD_ID_TO_ENTITY_TYPE[response.cmdId];
      if (!entityType) {
        this.logger.warn(`unknown cmdId for entity-count: ${response.cmdId}.`);
        return null;
      }

      if (typeof response.count !== 'number') {
        this.logger.warn(
          `missing count field in response cmdId: ${response.cmdId}`,
        );
        return null;
      }

      const result = {
        type: entityType,
        count: response.count,
      };

      return result;
    } catch (error) {
      this.logger.error(
        `entity-count parsing error (cmdId: ${response.cmdId}):`,
        error,
      );
      return null;
    }
  }

  /**
   * Parser for systemMetricsChart.
   * Converts timeseries (cpuUsage, memoryUsage, discUsage) to format:
   * { time: "11:05", cpu: 2, ram: 48, disk: 8 }
   */
  parseSystemMetrics(response: TelemetryResponse): SystemMetricsData[] | null {
    try {
      if (response.cmdId !== 10) {
        return null;
      }

      let timeseries: Record<string, any[]> | undefined;

      if (response.data && 'data' in response.data) {
        const entityData = response.data.data?.[0];
        timeseries = entityData?.timeseries;
      } else if (response.update && response.update.length > 0) {
        timeseries = response.update[0]?.timeseries;
      }

      if (!timeseries) {
        this.logger.warn('missing timeseries in systemMetrics');
        return null;
      }

      const cpuData = timeseries.cpuUsage || [];
      const memoryData = timeseries.memoryUsage || [];
      const diskData = timeseries.discUsage || [];

      const timestamps = new Set<number>([
        ...cpuData.map((d) => d.ts),
        ...memoryData.map((d) => d.ts),
        ...diskData.map((d) => d.ts),
      ]);

      const result = Array.from(timestamps)
        .sort((a, b) => a - b)
        .map((ts) => {
          const cpu = cpuData.find((d) => d.ts === ts);
          const mem = memoryData.find((d) => d.ts === ts);
          const disk = diskData.find((d) => d.ts === ts);

          return {
            time: this.formatTime(ts),
            cpu: cpu ? Math.round(parseFloat(cpu.value)) : 0,
            ram: mem ? Math.round(parseFloat(mem.value)) : 0,
            disk: disk ? Math.round(parseFloat(disk.value)) : 0,
          };
        });

      return result;
    } catch (error) {
      this.logger.error('systemMetrics parsing error:', error);
      return null;
    }
  }

  /**
   * Parser for transportMsgCountHourly.
   * Returns data for the last 30 days with 0 for days without data.
   */
  parseMsgDeviceCommunicationCount(
    response: TelemetryResponse,
  ): MsgCount[] | null {
    try {
      if (response.cmdId !== 9) {
        return null;
      }

      let timeseries: Record<string, any[]> | undefined;

      if (response.data && 'data' in response.data) {
        const entityData = response.data.data?.[0];
        timeseries = entityData?.timeseries;
      } else if (response.update && response.update.length > 0) {
        timeseries = response.update[0]?.timeseries;
      }

      if (!timeseries) {
        this.logger.warn('missing timeseries in systemMetrics');
        return null;
      }

      const transportMsgCountHourly = timeseries.transportMsgCountHourly;
      if (transportMsgCountHourly === undefined) {
        return [];
      }

      //map of dates to values from the timeseries data
      const dateToValue = new Map<string, number>();
      transportMsgCountHourly.forEach((d) => {
        const date = this.formatDate(d.ts);
        const currentValue = dateToValue.get(date) ?? 0;
        dateToValue.set(date, currentValue + parseInt(d.value, 10));
      });

      //array for last 30 days
      const result: MsgCount[] = [];
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      for (let i = 0; i <= 30; i++) {
        const currentDate = new Date(thirtyDaysAgo);
        currentDate.setDate(currentDate.getDate() + i);
        const dateStr = this.formatDate(currentDate.getTime());
        const value = dateToValue.get(dateStr) ?? 0;

        result.push({
          time: dateStr,
          value,
        });
      }

      return result;
    } catch (error) {
      this.logger.error(
        'parseMsgDeviceCommunicationCount parsing error:',
        error,
      );
      return null;
    }
  }

  private formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  parseNotificationCount(
    response: TelemetryResponse | any,
  ): { count: number; cmdId: number } | null {
    try {
      if (
        response.cmdUpdateType === 'NOTIFICATIONS_COUNT' ||
        (response.cmdId === 1 && typeof response.totalUnreadCount === 'number')
      ) {
        return {
          count: response.totalUnreadCount,
          cmdId: response.cmdId,
        };
      }
      return null;
    } catch (error) {
      this.logger.error('parseNotificationCount error:', error);
      return null;
    }
  }

  parseNotifications(
    response: TelemetryResponse | any,
  ): { notifications: any[]; count: number; cmdId: number } | null {
    try {
      if (
        response.cmdUpdateType === 'NOTIFICATIONS' ||
        (response.cmdId === 10 && Array.isArray(response.notifications))
      ) {
        return {
          notifications: response.notifications || [],
          count: response.totalUnreadCount, // It also returns updated count
          cmdId: response.cmdId,
        };
      }
      return null;
    } catch (error) {
      this.logger.error('parseNotifications error:', error);
      return null;
    }
  }
}
