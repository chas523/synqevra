import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { UploadImageCommand } from './upload-image.command';
import { ImageDto } from 'src/thingsboard/interface/rest/dtos/response/image.response.dto';
import { ConfigService } from '@nestjs/config';

@CommandHandler(UploadImageCommand)
export class UploadImageCommandHandler
    implements ICommandHandler<UploadImageCommand, Result<ImageDto, ThingsboardApiException>> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(command: UploadImageCommand): Promise<Result<ImageDto, ThingsboardApiException>> {
        try {
            const { file, fileName, title, imageSubType, accessToken } = command;

            const response = await this.thingsboardApi.uploadImage(
                accessToken,
                file,
                fileName,
                title,
                imageSubType,
            );

            return Ok(response);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
