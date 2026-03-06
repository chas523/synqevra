import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Ok, Err, Result } from 'oxide.ts';
import { CreateDomainCommand } from './create-domain.command';
import { THINGSBOARD_API_PORT, ThingsboardApiPort } from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(CreateDomainCommand)
export class CreateDomainCommandHandler implements ICommandHandler<CreateDomainCommand, Result<any, ThingsboardApiException>> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(command: CreateDomainCommand): Promise<Result<any, ThingsboardApiException>> {
        try {
            const data = await this.thingsboardApi.createDomain(command.accessToken, command.payload, command.oauth2ClientIds);
            return Ok(data);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
