import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import { THINGSBOARD_API_PORT, ThingsboardApiPort } from '../../ports/thingsboard.api.port';
import { CreateVersionCommand } from './create-version.command';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(CreateVersionCommand)
export class CreateVersionCommandHandler implements ICommandHandler<CreateVersionCommand, Result<string, ThingsboardApiException>> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(command: CreateVersionCommand): Promise<Result<string, ThingsboardApiException>> {
        const { accessToken, payload } = command;
        try {
            const response = await this.thingsboardApi.createVersion(accessToken, payload);
            return Ok(response);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
