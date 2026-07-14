import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from '../../../infrastructure/http/thingsboard.http.errors';
import { ThingsboardRollbackData } from '../../../thingsboard.types';

export class DeleteTenantCommand extends Command<
  Result<void, ThingsboardApiException>
> {
  public readonly rollbackData: ThingsboardRollbackData;

  constructor(rollbackData: ThingsboardRollbackData) {
    super();
    this.rollbackData = rollbackData;
  }
}
