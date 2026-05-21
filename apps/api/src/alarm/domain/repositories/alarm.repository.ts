import { EntityManager } from 'typeorm';

import { Alarm } from '../../infrastructure/persistence/alarm.entity';

export abstract class AlarmRepository {
  abstract withManager(manager: EntityManager): AlarmRepository;

  abstract findOpenAlarm(
    tenantId: string,
    deviceId: string,
    alarmType: string,
  ): Promise<Alarm | null>;

  abstract save(alarm: Alarm): Promise<Alarm>;
}
