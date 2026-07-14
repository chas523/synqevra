import {
  Body,
  Controller,
  Get,
  BadRequestException,
  InternalServerErrorException,
  Post,
  Query,
  Param,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import type { CurrentUser } from 'src/auth/types/current-user';

import {
  ValidateTokenUseCase,
  ValidateTokenResult,
} from '../../application/use-cases/validate-token.use-case';
import { InitialConnectionOrchestrator } from '../../application/initial-connection.orchestrator';
import { RegisterTenantRequestDto } from '../../../thingsboard/interface/rest/dtos/request/register-tenant.request.dto';
import { CreateTenantAdminRequestDto } from 'src/thingsboard/interface/rest/dtos/request/create-tenant-admin.request.dto';
import { InviteRequest, MedplumClient } from '@medplum/core';
import { MedplumClientFactory } from 'src/medplum/application/medplum-client.factory';
import e from 'express';
import { ProjectMembership } from '@medplum/fhirtypes';
import { ConfirmPractitionerUseCase } from 'src/connection/application/use-cases/confirm-practitioner.use-case';
import { ConfirmPractitionerOrchestrator } from 'src/connection/application/confirm-practitioner.orchestrator';
import { InitialConnectionResult } from '../../application/dto/initial-connection.result';
import { ConfirmPractitionerResult } from '../../application/dto/confirm-practitioner.result';
import { GetConnectionStatusUseCase } from '../../application/use-cases/get-connection-status.use-case';
import { ConnectionRepository } from '../../domain/repositories/connection.repository';

@ApiTags('Connection')
@Controller('connection')
export class ConnectionController {
  constructor(
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly initialConnectionOrchestrator: InitialConnectionOrchestrator,
    private readonly confirmPractitionerOrchestrator: ConfirmPractitionerOrchestrator,
    private readonly medplum: MedplumClientFactory,
    private readonly confirmPractitionerUseCase: ConfirmPractitionerUseCase,
    private readonly getConnectionStatusUseCase: GetConnectionStatusUseCase,
    private readonly connectionRepository: ConnectionRepository,
  ) {}

  @Public()
  @Post('/connect')
  @ApiOperation({
    summary:
      'Create initial configuration for a new user. Sets up thingsboard and medplum projects.',
    description:
      'Register a new tenant and create its administrator account using an activation token. Its used in /auth/activate url on frontend. Needs to have a valid activation token.',
  })
  @ApiQuery({
    name: 'token',
    type: String,
    required: true,
    description: 'Activation token for tenant registration',
  })
  @ApiBody({
    type: RegisterTenantRequestDto,
    description: 'Tenant and admin user registration data',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tenant and admin account created successfully',
    type: InitialConnectionResult,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or token validation failed',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'An error occurred during tenant initialization',
  })
  async buildInitialConnection(
    @Body() formData: RegisterTenantRequestDto,
    @Query('token') token: string,
  ) {
    return await this.initialConnectionOrchestrator.run(formData, token);
  }

  @Public()
  @Get('/get-status/:id')
  @ApiOperation({
    summary: 'Get connection status for a tenant',
    description:
      'Returns the Medplum connection status for a given Thingsboard tenantId.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Thingsboard tenant ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connection status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        medplum: { type: 'boolean', nullable: true },
      },
    },
  })
  async getConnectionStatus(@Param('id') tenantId: string) {
    return this.getConnectionStatusUseCase.execute(tenantId);
  }

  @Get('/me/status')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Medplum connection status for the current user',
    description:
      'Returns whether the currently logged-in user has a Medplum connection configured.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connection status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        medplum: { type: 'boolean' },
      },
    },
  })
  async getMyConnectionStatus(@ActiveUser() user: CurrentUser) {
    const connection = await this.connectionRepository.getConnectionByUserId(
      user.id,
    );
    console.log(connection);
    return { medplum: connection?.medplumId != null };
  }

  @Public()
  @Get('/checkValidation')
  @ApiOperation({
    summary: 'Validate activation token',
    description:
      'Check if an activation token is valid and retrieve associated information. Used on front before accessing /auth/activate pages.',
  })
  @ApiQuery({
    name: 'token',
    type: String,
    required: true,
    description: 'Activation token to validate',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token is valid',
    type: ValidateTokenResult,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Token is invalid or expired',
  })
  async checkToken(@Query('token') token: string) {
    return await this.validateTokenUseCase.execute(token);
  }

  @Public()
  @Post('/confirm-practitioner')
  @ApiOperation({
    summary: 'Confirm practitioner account',
    description:
      'Confirm and activate a practitioner account using an invitation token',
  })
  @ApiQuery({
    name: 'token',
    type: String,
    required: true,
    description: 'Practitioner invitation token',
  })
  @ApiBody({
    type: CreateTenantAdminRequestDto,
    description: 'Practitioner account information and credentials',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Practitioner account confirmed successfully',
    type: ConfirmPractitionerResult,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or domain error during confirmation',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'An error occurred during practitioner confirmation',
  })
  async confirmPractitioner(
    @Body() formData: CreateTenantAdminRequestDto,
    @Query('token') token: string,
  ) {
    console.log('Formdata:', formData);
    console.log('Token:', token);

    try {
      await this.confirmPractitionerOrchestrator.run(formData, token);
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
