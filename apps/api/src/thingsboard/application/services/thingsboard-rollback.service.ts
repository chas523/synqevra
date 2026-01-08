import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../ports/thingsboard.api.port';

// thingsboard-rollback.service.ts
@Injectable()
export class ThingsboardRollbackService {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
    private readonly configService: ConfigService,
  ) {}

  async rollbackTenantAdmin(rollbackData: {
    tenantId: string;
    userId: string;
    sysAdminAccessToken: string;
  }): Promise<void> {
    try {
      await this.thingsboardApi.deleteTenantAdmin(
        rollbackData.userId,
        rollbackData.sysAdminAccessToken,
      );
    } catch (error) {
      // log error
    }
  }

  async rollbackTenant(rollbackData: {
    tenantId: string;
    userId: string;
    sysAdminAccessToken: string;
  }): Promise<void> {
    try {
      await this.thingsboardApi.deleteTenant(
        rollbackData.tenantId,
        rollbackData.sysAdminAccessToken,
      );
    } catch (error) {
      // log error
    }
  }
}
