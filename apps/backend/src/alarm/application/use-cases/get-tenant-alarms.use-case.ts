import { Inject, Injectable } from '@nestjs/common';

import { CurrentUser } from '../../../auth/types/current-user';
import {
  THINGSBOARD_REPOSITORY_PORT,
  ThingsboardRepositoryPort,
} from '../../../thingsboard/application/ports/thingsboard.repository.port';
import { AlarmRepository } from '../../domain/repositories/alarm.repository';
import {
  TenantAlarmResponseDto,
  TenantAlarmsPageResponseDto,
} from '../dto/tenant-alarms.response.dto';

@Injectable()
export class GetTenantAlarmsUseCase {
  constructor(
    private readonly alarmRepository: AlarmRepository,
    @Inject(THINGSBOARD_REPOSITORY_PORT)
    private readonly thingsboardRepository: ThingsboardRepositoryPort,
  ) {}

  async execute(params: {
    user: CurrentUser;
    page: number;
    pageSize: number;
  }): Promise<TenantAlarmsPageResponseDto> {
    const thingsboardConnection = await this.thingsboardRepository.findByUserId(
      params.user.id,
    );

    if (!thingsboardConnection) {
      return {
        data: [],
        totalPages: 0,
        totalElements: 0,
        hasNext: false,
      };
    }

    const tenantId = thingsboardConnection.getTenantId();
    const { data, totalElements } = await this.alarmRepository.findByTenantPaginated({
      tenantId,
      page: params.page,
      pageSize: params.pageSize,
    });

    const totalPages =
      params.pageSize > 0 ? Math.ceil(totalElements / params.pageSize) : 0;

    return {
      data: data.map((alarm) => this.toDto(alarm)),
      totalPages,
      totalElements,
      hasNext: params.page + 1 < totalPages,
    };
  }

  private toDto(alarm: {
    id: string;
    tenantId: string;
    deviceId: string;
    alarmType: string;
    status: string;
    lastEventId: string;
    currentValue?: Record<string, unknown>;
    thresholdSnapshot?: Record<string, unknown>;
    suppressed: boolean;
    acknowledgedAt?: Date;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }): TenantAlarmResponseDto {
    return {
      id: alarm.id,
      tenantId: alarm.tenantId,
      deviceId: alarm.deviceId,
      alarmType: alarm.alarmType,
      status: alarm.status as TenantAlarmResponseDto['status'],
      lastEventId: alarm.lastEventId,
      currentValue: alarm.currentValue ?? {},
      thresholdSnapshot: alarm.thresholdSnapshot ?? {},
      suppressed: alarm.suppressed,
      acknowledgedAt: alarm.acknowledgedAt?.toISOString(),
      resolvedAt: alarm.resolvedAt?.toISOString(),
      createdAt: alarm.createdAt.toISOString(),
      updatedAt: alarm.updatedAt.toISOString(),
    };
  }
}
