import {
  Body,
  Controller,
  Get,
  BadRequestException,
  InternalServerErrorException,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { ValidateTokenUseCase } from '../../application/use-cases/validate-token.use-case';
import { InitialConnectionOrchestrator } from '../../application/initial-connection.orchestrator';
import { RegisterTenantRequestDto } from '../../../thingsboard/interface/rest/dtos/request/register-tenant.request.dto';
import { CreateTenantAdminRequestDto } from 'src/thingsboard/interface/rest/dtos/request/create-tenant-admin.request.dto';
import { InviteRequest, MedplumClient } from '@medplum/core';
import { MedplumClientFactory } from 'src/medplum/application/medplum-client.factory';
import e from 'express';
import { ProjectMembership } from '@medplum/fhirtypes';
import { ConfirmPractitionerUseCase } from 'src/connection/application/use-cases/confirm-practitioner.use-case';

@Controller('connection')
export class ConnectionController {
  constructor(
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly initialConnectionOrchestrator: InitialConnectionOrchestrator,
    private readonly medplum: MedplumClientFactory,
    private readonly confirmPractitionerUseCase: ConfirmPractitionerUseCase,
  ) {}

  @Public()
  @Post('/connect')
  async buildInitialConnection(
    @Body() formData: RegisterTenantRequestDto,
    @Query('token') token: string,
  ) {
    return await this.initialConnectionOrchestrator.run(formData, token);
  }

  @Public()
  @Get('/checkValidation')
  async checkToken(@Query('token') token: string) {
    return await this.validateTokenUseCase.execute(token);
  }

  @Public()
  @Post('/confirm-practitioner')
  async confirmPractitioner(
    @Body() formData: CreateTenantAdminRequestDto,
    @Query('token') token: string,
  ) {
    console.log('Formdata:', formData);
    console.log('Token:', token);

    try {
      await this.confirmPractitionerUseCase.execute(formData, token);
    } catch (error) {
      const isDomainError = error?.code !== undefined;
      const statusCode = isDomainError ? 400 : 500;
      const errorMessage =
        error?.message || 'An error occurred during practitioner confirmation';

      console.error('Error during practitioner confirmation:', {
        message: errorMessage,
        code: error?.code,
        statusCode,
      });

      if (isDomainError) {
        throw new BadRequestException({
          success: false,
          message: errorMessage,
          code: error?.code,
        });
      }

      throw new InternalServerErrorException({
        success: false,
        message: errorMessage,
      });
    }
  }
}
