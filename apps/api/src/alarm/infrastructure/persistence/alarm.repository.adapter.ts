import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { AlarmStatus } from '../../domain/enums/alarm-status.enum';
import { AlarmRepository } from '../../domain/repositories/alarm.repository';

import { Alarm } from './alarm.entity';

@Injectable()
export class AlarmRepositoryAdapter extends AlarmRepository {
  constructor(
    @InjectRepository(Alarm)
    private readonly repository: Repository<Alarm>,
  ) {
    super();
  }

  withManager(manager: EntityManager): AlarmRepository {
    return new AlarmRepositoryAdapter(manager.getRepository(Alarm));
  }

  async findOpenAlarm(
    tenantId: string,
    deviceId: string,
    alarmType: string,
  ): Promise<Alarm | null> {
    const alarm = await this.repository.findOne({
      where: {
        tenantId,
        deviceId,
        alarmType,
        status: In([AlarmStatus.OPEN_UNACK, AlarmStatus.OPEN_ACK]),
      },
    });

    return alarm;
  }

  async save(alarm: Alarm): Promise<Alarm> {
    return this.repository.save(alarm);
  }
}
