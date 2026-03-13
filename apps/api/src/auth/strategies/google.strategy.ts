import { Inject, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as CustomStrategy } from 'passport-strategy';
import {
  Strategy as GoogleOAuth20Strategy,
  VerifyCallback,
} from 'passport-google-oauth20';
import { ValidateGoogleUserUseCase } from '../../iam/application/use-cases/validate-google-user.use-case';
import { SysAdminAuthService } from '../../thingsboard/application/services/sysadmin-auth.service';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../thingsboard/application/ports/thingsboard.api.port';
import type { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(CustomStrategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  // Since we fetch keys from the database, we need a "hidden" real Google strategy,
  // which we configure on the fly (known as the Proxy Strategy pattern).
  private innerStrategy: GoogleOAuth20Strategy | null = null;
  private cachedClientId: string | null = null;

  constructor(
    private readonly validateGoogleUserUseCase: ValidateGoogleUserUseCase,
    private readonly sysAdminAuthService: SysAdminAuthService,
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {
    super();
  }

  /**
   * Main entry point. Automatically called by Passport/NestJS.
   */
  async authenticate(req: Request, options?: any) {
    try {
      // 1. Fetch current keys (clientId/Secret) from the ThingsBoard database
      const googleConfig = await this.getGoogleConfigFromThingsBoard();

      if (!googleConfig) {
        this.logger.error(
          'No Google OAuth2 configuration found in ThingsBoard',
        );
        return this.fail('Google OAuth2 configuration missing', 401);
      }

      // 2. Prepare or update the "real" Google strategy
      const strategy = this.resolveInnerStrategy(googleConfig);

      // 3. Delegate control to the actual Google strategy
      strategy.authenticate(req, options);
    } catch (error) {
      this.logger.error('Error during dynamic Google authorization', error);
      this.error(error);
    }
  }

  /**
   * Fetches OAuth2 configuration from the ThingsBoard API.
   * This ensures we don't need to restart the server after changing keys in the panel.
   */
  private async getGoogleConfigFromThingsBoard() {
    // Log in as system admin to be able to read OAuth2 settings
    const token = await this.sysAdminAuthService.getAccessToken();

    // Look through the list of all providers for one that includes "google" in its name
    const clientInfos = await this.thingsboardApi.getOAuth2ClientInfos(token, {
      page: 0,
      pageSize: 100,
      sortProperty: 'createdTime',
      sortOrder: 'DESC',
    });

    const googleSummary = (clientInfos?.data || []).find((client: any) =>
      client.providerName.toLowerCase().includes('google'),
    );

    if (!googleSummary) return null;

    // Fetch full details (including clientSecret), which are not available in the summary list
    const fullDetails = await this.thingsboardApi.getOAuth2ClientById(
      token,
      googleSummary.id.id,
    );

    if (!fullDetails?.clientId || !fullDetails?.clientSecret) return null;

    return {
      clientId: fullDetails.clientId,
      clientSecret: fullDetails.clientSecret,
    };
  }

  /**
   * Creates or updates the GoogleOAuth20Strategy object.
   * Connects our wrapper with the original Passport-Google library code.
   */
  private resolveInnerStrategy(config: {
    clientId: string;
    clientSecret: string;
  }): GoogleOAuth20Strategy {
    // If the keys haven't changed, use the same instance (caching for performance)
    if (!this.innerStrategy || this.cachedClientId !== config.clientId) {
      this.logger.debug('(Re)initializing Google strategy with new keys');

      this.innerStrategy = new GoogleOAuth20Strategy(
        {
          clientID: config.clientId,
          clientSecret: config.clientSecret,
          callbackURL:
            process.env.GOOGLE_OAUTH_CALLBACK_URL ||
            `${process.env.BACKEND_API_URL}/auth/google/callback`,
          scope: ['email', 'profile'],
        },
        // Function called after successful data retrieval from Google
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await this.validate(profile);
            done(null, user as any);
          } catch (err) {
            done(err);
          }
        },
      );

      this.cachedClientId = config.clientId;
    }

    // KEY MOMENT: Pass the success/fail functions from our class
    // to the "inner" strategy. Without this, Passport wouldn't know where to return.
    this.innerStrategy.success = this.success.bind(this);
    this.innerStrategy.fail = this.fail.bind(this);
    this.innerStrategy.redirect = this.redirect.bind(this);
    this.innerStrategy.pass = this.pass.bind(this);
    this.innerStrategy.error = this.error.bind(this);

    return this.innerStrategy;
  }

  /**
   * Processes the profile received from Google into a user in our system.
   */
  async validate(profile: any) {
    try {
      const { name, emails } = profile;

      return await this.validateGoogleUserUseCase.execute({
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
      });
    } catch (err: any) {
      this.logger.error('Error during Google profile validation', err);
      throw err;
    }
  }
}
