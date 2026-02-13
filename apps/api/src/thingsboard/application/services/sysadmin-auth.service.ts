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

    private token: string | null = null;
    private tokenExpirationTime: number | null = null;
    // Buffer time in seconds before actual expiration to refresh token
    private readonly TOKEN_REFRESH_BUFFER_SECONDS = 60;

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
     * Caches the token and reuses it until it is close to expiration.
     * @throws ThingsboardApiException if authentication fails
     */
    async getAccessToken(): Promise<string> {
        const currentTime = Math.floor(Date.now() / 1000);

        if (this.token && this.tokenExpirationTime && currentTime < this.tokenExpirationTime - this.TOKEN_REFRESH_BUFFER_SECONDS) {
            return this.token;
        }

        this.logger.debug('Authenticating as SysAdmin (Token missing or expired)');
        const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
            this.sysAdminEmail,
            this.sysAdminPassword,
        );

        this.token = loginResponse.token;
        // Basic JWT expiration extraction without external library dependency if possible, 
        // or just use a default safe assumption if token doesn't have exp claim readily available.
        // For robustness, let's parse the JWT to get the 'exp' claim.
        try {
            const payloadServices = loginResponse.token.split('.')[1];
            if (payloadServices) {
                const payload = JSON.parse(Buffer.from(payloadServices, 'base64').toString());
                if (payload.exp) {
                    this.tokenExpirationTime = payload.exp;
                    this.logger.debug(`Token cached, expires at ${new Date(payload.exp * 1000).toISOString()}`);
                } else {
                    // Fallback if no exp claim: expire in 5 minutes
                    this.tokenExpirationTime = currentTime + 300;
                }
            }
        } catch (e) {
            this.logger.warn('Failed to parse JWT token expiration, using default timeout');
            this.tokenExpirationTime = currentTime + 300; // 5 minutes default
        }

        return this.token;
    }

    /**
     * Explicitly clears the cached token, forcing a fresh login on next request.
     * Useful if a 401 is encountered despite having a cached token.
     */
    clearToken() {
        this.token = null;
        this.tokenExpirationTime = null;
    }
}
