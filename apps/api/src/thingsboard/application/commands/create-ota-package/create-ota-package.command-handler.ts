import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { CreateOtaPackageCommand } from './create-ota-package.command';
import { OtaPackageDto } from 'src/thingsboard/interface/rest/dtos/response/ota-package.response.dto';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(CreateOtaPackageCommand)
export class CreateOtaPackageCommandHandler implements ICommandHandler<
  CreateOtaPackageCommand,
  Result<OtaPackageDto, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: CreateOtaPackageCommand,
  ): Promise<Result<OtaPackageDto, ThingsboardApiException>> {
    const { accessToken, payload } = command;
    try {
      const otaPackage = await this.thingsboardApi.createOtaPackage(
        accessToken,
        payload,
      );
      return Ok(otaPackage);
    } catch (error) {
      return Err(
        ThingsboardApiException.createException(
          'Failed to create OTA package',
          error,
        ),
      );
    }
  }
}
