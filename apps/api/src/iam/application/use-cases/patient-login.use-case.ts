import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PatientRepository } from '../../domain/repositories/patient.repository';
import { Role } from '../../domain/enums/role.enum';
import { LoginResult } from '../dto/login.result';
import type { Response } from 'express';
import * as argon2 from 'argon2';

export interface PatientLoginCommand {
  userId: number;
  response: Response;
}

@Injectable()
export class PatientLoginUseCase {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: PatientLoginCommand): Promise<LoginResult> {
    const { userId, response } = command;

    const patient = await this.patientRepository.getPatientById(userId);

    //would never happen if used with LocalPatientAuthGuard in login endpoint
    if (!patient) {
      throw new InternalServerErrorException(
        'Patient not found after authentication',
      );
    }

    const patientId = patient.id!;

    const accessToken = await this.authService.generateAccessToken(
      patientId,
      Role.PATIENT,
    );
    const refreshToken = await this.authService.generateRefreshToken(
      patientId,
      Role.PATIENT,
    );
    const hashedRt = await argon2.hash(refreshToken);

    await this.patientRepository.updateHashedRt(patientId, hashedRt);

    this.authService.setTokenCookies(response, accessToken, refreshToken);

    return { id: patientId, role: Role.PATIENT, success: true };
  }
}
