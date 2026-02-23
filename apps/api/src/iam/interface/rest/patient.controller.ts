import { Controller, HttpCode, HttpStatus, Post, Body, Res, UseGuards } from '@nestjs/common';

import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginResult } from '../../application/dto/login.result';
import { PatientLoginUseCase } from '../../application/use-cases/patient-login.use-case';
import type { Response } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { LocalPatientAuthGuard } from 'src/auth/guards/local-auth/local-patient-auth.guard';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import type { CurrentUser } from 'src/auth/types/current-user';

@ApiTags("Patient")
@Controller('patient')
export class PatientController {
    constructor(
        private readonly patientLoginUseCase: PatientLoginUseCase,
    ) { }

    @Public()
    @UseGuards(LocalPatientAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiOperation({
        summary: 'Patient login endpoint',
        description: 'Authenticate patient with email and password. Returns tokens in http secure cookies. ',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Login successful, tokens returned',
        type: LoginResult,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid email or password',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: { type: 'string', format: 'email', example: 'patient@softteco.com' },
                password: { type: 'string', example: 'softteco-password', minLength: 6 },
            },
        },
    })
    async patientLogin(
        @ActiveUser() patient: CurrentUser,
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.patientLoginUseCase.execute({
            userId: patient.id,
            response: res,
        });
    }
}

