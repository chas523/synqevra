import {
  EntityType,
  EntityCountCommand,
  EntityDataCommand,
} from '../../interface/websocket/types/telemetry.types';

//Pre defined values that thingsboard uses when passing data through websockets
export class DashboardQueries {
  static readonly CMD_IDS = {
    // Entity counts: 1-10
    TENANT_COUNT: 3,
    DEVICE_COUNT: 5,
    USER_COUNT: 7,

    // MSG DAILY DEVICE COMMUNICATION
    MSG_DEVICE_COMMUNICATION: 9,

    // API Usage State: 11-20
    CPU_USAGE: 11,
    MEMORY_USAGE: 12,
    DISK_USAGE: 13,
  } as const;

  static entityCount(
    entityType: EntityType,
    cmdId: number,
  ): EntityCountCommand {
    return {
      type: 'ENTITY_COUNT',
      query: {
        entityFilter: {
          type: 'entityType',
          resolveMultiple: true,
          entityType,
        },
      },
      cmdId,
    };
  }

  static allEntityCounts(): EntityCountCommand[] {
    return [
      this.entityCount('TENANT', this.CMD_IDS.TENANT_COUNT),
      this.entityCount('DEVICE', this.CMD_IDS.DEVICE_COUNT),
      this.entityCount('USER', this.CMD_IDS.USER_COUNT),
    ];
  }

  static apiUsageWithTimeseries(options: {
    keys: string[];
    cmdId: number;
    timeWindowMinutes?: number;
    intervalSeconds?: number;
    aggregation?: 'AVG' | 'SUM' | 'MIN' | 'MAX' | 'COUNT' | 'NONE';
    timeZoneId?: string;
  }): [EntityDataCommand, EntityDataCommand] {
    const timeWindowMs = (options.timeWindowMinutes || 60) * 60 * 1000;
    const intervalMs = (options.intervalSeconds || 10) * 1000;
    const limit = Math.ceil(timeWindowMs / intervalMs);

    //1st command
    const queryCmd: EntityDataCommand = {
      type: 'ENTITY_DATA',
      query: {
        entityFilter: {
          type: 'apiUsageState',
          resolveMultiple: true,
        },
        pageLink: {
          page: 0,
          pageSize: 1024,
          sortOrder: {
            key: { type: 'ENTITY_FIELD', key: 'createdTime' },
            direction: 'DESC',
          },
        },
        entityFields: [
          { type: 'ENTITY_FIELD', key: 'name' },
          { type: 'ENTITY_FIELD', key: 'label' },
          { type: 'ENTITY_FIELD', key: 'additionalInfo' },
        ],
        latestValues: [],
      },
      cmdId: options.cmdId,
    };

    //2nd command (won't work without the 1st one passed beforehand)
    const tsCmd: EntityDataCommand = {
      type: 'ENTITY_DATA',
      cmdId: options.cmdId,
      tsCmd: {
        keys: options.keys,
        startTs: Date.now() - timeWindowMs,
        timeWindow: timeWindowMs,
        interval: intervalMs,
        intervalType: 'MILLISECONDS',
        limit,
        timeZoneId: options.timeZoneId || 'Europe/Warsaw',
        agg: options.aggregation || 'AVG',
      },
    };

    return [queryCmd, tsCmd];
  }

  static msgWithTimeseries(options: {
    keys: string[];
    cmdId: number;
    timeWindowDays?: number;
    intervalMs?: number;
    aggregation?: 'AVG' | 'SUM' | 'MIN' | 'MAX' | 'COUNT' | 'NONE';
    timeZoneId?: string;
  }): [EntityDataCommand, EntityDataCommand] {
    const timeWindowMs = (options.timeWindowDays || 30) * 24 * 60 * 60 * 1000;
    const intervalMs = options.intervalMs || timeWindowMs / 30;
    const limit = Math.ceil(timeWindowMs / intervalMs);

    //1st command
    const queryCmd: EntityDataCommand = {
      type: 'ENTITY_DATA',
      query: {
        entityFilter: {
          type: 'apiUsageState',
          resolveMultiple: true,
        },
        pageLink: {
          page: 0,
          pageSize: 1024,
          sortOrder: {
            key: { type: 'ENTITY_FIELD', key: 'createdTime' },
            direction: 'DESC',
          },
        },
        entityFields: [
          { type: 'ENTITY_FIELD', key: 'name' },
          { type: 'ENTITY_FIELD', key: 'label' },
          { type: 'ENTITY_FIELD', key: 'additionalInfo' },
        ],
        latestValues: [],
      },
      cmdId: options.cmdId,
    };

    //2nd command (won't work without the 1st one passed beforehand)
    const historyCmd: EntityDataCommand = {
      type: 'ENTITY_DATA',
      cmdId: options.cmdId,
      historyCmd: {
        keys: options.keys,
        startTs: Date.now() - timeWindowMs,
        endTs: Date.now(),
        interval: intervalMs,
        intervalType: 'MILLISECONDS',
        limit,
        timeZoneId: options.timeZoneId || 'Europe/Warsaw',
        agg: options.aggregation || 'SUM',
      },
    };

    return [queryCmd, historyCmd];
  }

  //function for cmdId = 10, we need to pass both directly in such order to get hourly data for usage chart
  static systemMetricsWithTimeseries(
    cmdId: number,
  ): [EntityDataCommand, EntityDataCommand] {
    return this.apiUsageWithTimeseries({
      keys: ['cpuUsage', 'memoryUsage', 'discUsage'],
      cmdId,
      timeWindowMinutes: 60,
      intervalSeconds: 10,
    });
  }

  //function for cmdId = 9, we need to pass both directly in such order to get hourly data for number of messages
  static msgDeviceCommunicationWithTimeseries(
    cmdId: number,
  ): [EntityDataCommand, EntityDataCommand] {
    return this.msgWithTimeseries({
      keys: ['transportMsgCountHourly'],
      cmdId,
      timeWindowDays: 30,
      intervalMs: 24 * 60 * 60 * 1000, //one day = 86400000ms
    });
  }
}
