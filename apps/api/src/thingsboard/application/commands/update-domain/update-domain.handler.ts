import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Ok, Err, Result } from 'oxide.ts';
import { UpdateDomainCommand } from './update-domain.command';
import { THINGSBOARD_API_PORT, ThingsboardApiPort } from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(UpdateDomainCommand)
export class UpdateDomainCommandHandler implements ICommandHandler<UpdateDomainCommand, Result<any, ThingsboardApiException>> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(command: UpdateDomainCommand): Promise<Result<any, ThingsboardApiException>> {
        try {
            const data = await this.thingsboardApi.updateDomain(
                command.accessToken,
                command.domainId,
                command.payload,
                command.oauth2ClientIds,
            );
            return Ok(data);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
