import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, Ok, Err } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { DeleteOtaPackageCommand } from './delete-ota-package.command';

@CommandHandler(DeleteOtaPackageCommand)
export class DeleteOtaPackageCommandHandler implements ICommandHandler<
  DeleteOtaPackageCommand,
  Result<void, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
  ) {}

  async execute(
    command: DeleteOtaPackageCommand,
  ): Promise<Result<void, ThingsboardApiException>> {
    const { accessToken, id } = command;

    try {
      await this.thingsboardApiPort.deleteOtaPackage(accessToken, id);
      return Ok(undefined);
    } catch (error) {
      return Err(
        ThingsboardApiException.createException(
          'Failed to delete OTA package',
          error,
        ),
      );
    }
  }
}
