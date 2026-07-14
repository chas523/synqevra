import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ActiveUser } from '../../../auth/decorators/active-user.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import type { CurrentUser } from '../../../auth/types/current-user';
import { Role } from '../../../iam/domain/enums/role.enum';
import { GetAlarmHistoryUseCase } from '../../application/use-cases/get-alarm-history.use-case';
import { GetTenantAlarmsUseCase } from '../../application/use-cases/get-tenant-alarms.use-case';
import { UpdateTenantAlarmStatusUseCase } from '../../application/use-cases/update-tenant-alarm-status.use-case';
import { UpdateTenantAlarmStatusRequestDto } from './dtos/request/update-tenant-alarm-status.request.dto';

@Controller('alarm')
export class AlarmQueryController {
  constructor(
    private readonly getTenantAlarmsUseCase: GetTenantAlarmsUseCase,
    private readonly getAlarmHistoryUseCase: GetAlarmHistoryUseCase,
    private readonly updateTenantAlarmStatusUseCase: UpdateTenantAlarmStatusUseCase,
  ) {}

  @Roles(Role.MODERATOR, Role.PRACTITIONER, Role.USER)
  @Get('tenant')
  @ApiOperation({
    summary: 'Fetch alarms for current user tenant',
    description:
      'Returns alarm records stored by the API alarm engine for tenant linked to current user.',
  })
  async getTenantAlarms(
    @ActiveUser() user: CurrentUser,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 50,
  ) {
    return this.getTenantAlarmsUseCase.execute({
      user,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER, Role.USER)
  @Get('tenant/:alarmId/history')
  @ApiOperation({
    summary: 'Fetch alarm history for current user tenant',
    description:
      'Returns historical outbox entries for a specific alarm in current tenant scope.',
  })
  async getAlarmHistory(
    @ActiveUser() user: CurrentUser,
    @Param('alarmId') alarmId: string,
    @Query('limit') limit = 100,
  ) {
    return this.getAlarmHistoryUseCase.execute({
      user,
      alarmId,
      limit: Number(limit),
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER, Role.USER)
  @Patch('tenant/:alarmId/status')
  @ApiOperation({
    summary: 'Update alarm status for current user tenant',
    description:
      'Updates alarm status in current tenant scope and emits websocket update.',
  })
  async updateAlarmStatus(
    @ActiveUser() user: CurrentUser,
    @Param('alarmId') alarmId: string,
    @Body() body: UpdateTenantAlarmStatusRequestDto,
  ) {
    return this.updateTenantAlarmStatusUseCase.execute({
      user,
      payload: {
        alarmId,
        status: body.status,
      },
    });
  }
}
