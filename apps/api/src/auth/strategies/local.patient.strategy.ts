import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from 'src/iam/application/auth/auth.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalPatientStrategy extends PassportStrategy(Strategy, 'local-patient') {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'email',
        });
    }

    validate(email: string, password: string) {
        return this.authService.validatePatient(email, password);
    }
}
