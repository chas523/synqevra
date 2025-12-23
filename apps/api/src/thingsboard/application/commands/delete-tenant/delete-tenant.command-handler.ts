import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTenantCommand } from './delete-tenant.command';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from '../../../infrastructure/http/thingsboard.http.errors';
import { Inject, Logger } from '@nestjs/common';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@CommandHandler(DeleteTenantCommand)
export class DeleteTenantCommandHandler
  implements
    ICommandHandler<DeleteTenantCommand, Result<void, ThingsboardApiException>>
{
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
  ) {}

  private readonly logger = new Logger(DeleteTenantCommandHandler.name);

  async execute(
    command: DeleteTenantCommand,
  ): Promise<Result<void, ThingsboardApiException>> {
    const { tenantId, sysAdminAccessToken } = command.rollbackData;

    this.logger.warn('Starting rollback of changes');

    if (!sysAdminAccessToken || !tenantId) {
      this.logger.warn('No sysadmin token or tenant ID for rollback');
      return Err(
        ThingsboardApiException.createException(
          'No sysadmin token or tenant ID for rollback',
          undefined,
        ),
      );
    }

    try {
      await this.thingsboardApiPort.deleteTenant(tenantId,sysAdminAccessToken);
      return Ok(undefined);
    } catch (error) {
      return Err(
        ThingsboardApiException.createException(
          'No sysadmin token or tenant ID for rollback',
          error,
        ),
      );
    }
  }
}
