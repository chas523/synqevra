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

  abstract findById(id: string): Promise<Alarm | null>;

  abstract findByTenantPaginated(params: {
    tenantId: string;
    page: number;
    pageSize: number;
  }): Promise<{ data: Alarm[]; totalElements: number }>;
}
