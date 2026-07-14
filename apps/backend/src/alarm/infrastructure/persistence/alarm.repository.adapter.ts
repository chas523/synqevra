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

  async findById(id: string): Promise<Alarm | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findByTenantPaginated(params: {
    tenantId: string;
    page: number;
    pageSize: number;
  }): Promise<{ data: Alarm[]; totalElements: number }> {
    const [data, totalElements] = await this.repository.findAndCount({
      where: {
        tenantId: params.tenantId,
      },
      order: {
        updatedAt: 'DESC',
      },
      skip: params.page * params.pageSize,
      take: params.pageSize,
    });

    return {
      data,
      totalElements,
    };
  }
}
