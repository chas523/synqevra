import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { CreateQueueCommand } from './create-queue.command';
import { QueueDto } from 'src/thingsboard/interface/rest/dtos/response/queue.response.dto';
import { ConfigService } from '@nestjs/config';

@CommandHandler(CreateQueueCommand)
export class CreateQueueCommandHandler
    implements
    ICommandHandler<
        CreateQueueCommand,
        Result<QueueDto, ThingsboardApiException>
    > {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
        private readonly configService: ConfigService,
    ) { }

    private get THINGSBOARD_SYSADMIN_EMAIL(): string {
        return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_EMAIL');
    }

    private get THINGSBOARD_SYSADMIN_PASSWORD(): string {
        return this.configService.getOrThrow<string>(
            'THINGSBOARD_SYSADMIN_PASSWORD',
        );
    }

    async execute(
        command: CreateQueueCommand,
    ): Promise<Result<QueueDto, ThingsboardApiException>> {
        try {
            const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
                this.THINGSBOARD_SYSADMIN_EMAIL,
                this.THINGSBOARD_SYSADMIN_PASSWORD,
            );

            const result = await this.thingsboardApi.createQueue(
                loginResponse.token,
                command.queue,
            );

            return Ok(result);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
