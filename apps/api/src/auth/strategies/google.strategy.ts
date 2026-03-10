import { Inject, Injectable } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import googleOauthConfig from "src/config/google-oauth.config";
import { ValidateGoogleUserUseCase } from "../../iam/application/use-cases/validate-google-user.use-case";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {

    constructor(
        @Inject(googleOauthConfig.KEY)
        private googleConfiguration: ConfigType<typeof googleOauthConfig>,
        private readonly validateGoogleUserUseCase: ValidateGoogleUserUseCase,
    ) {
        super({
            clientID: googleConfiguration.clientId!,
            clientSecret: googleConfiguration.clientSecret!,
            callbackURL: googleConfiguration.callbackURL!,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
        const { name, emails } = profile;
        const email = emails[0].value;
        const firstName = name.givenName;
        const lastName = name.familyName;

        const authResult = await this.validateGoogleUserUseCase.execute({
            email,
            firstName,
            lastName,
        });

        // req.user will contain either the pending user or existing user flag
        done(null, authResult);
    }
}