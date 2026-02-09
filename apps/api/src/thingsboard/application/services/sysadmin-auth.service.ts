import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../ports/thingsboard.api.port';

/**
 * Domain Service for SysAdmin authentication.
 * Encapsulates the logic for authenticating as ThingsBoard system administrator.
 */
@Injectable()
export class SysAdminAuthService {
    private readonly logger = new Logger(SysAdminAuthService.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
        private readonly configService: ConfigService,
    ) { }

    private get sysAdminEmail(): string {
        return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_EMAIL');
    }

    private get sysAdminPassword(): string {
        return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_PASSWORD');
    }

    /**
     * Authenticates as SysAdmin and returns the access token.
     * @throws ThingsboardApiException if authentication fails
     */
    async getAccessToken(): Promise<string> {
        this.logger.debug('Authenticating as SysAdmin');
        const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
            this.sysAdminEmail,
            this.sysAdminPassword,
        );
        return loginResponse.token;
    }
}
