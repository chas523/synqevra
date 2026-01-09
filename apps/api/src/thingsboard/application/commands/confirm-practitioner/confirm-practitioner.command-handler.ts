import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Ok, Err, Result } from 'oxide.ts';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
  EntityId,
} from '../../ports/thingsboard.api.port';

import {
  RegisterTenantError,
  PasswordMismatchError,
  UserAlreadyExistsError,
  TenantCreationError,
  RuleChainCreationError,
  RuleChainConfigurationError,
  DeviceProfileUpdateError,
  ThingsboardConnectionExistsError,
  UserActivationError,
  InvalidActivationLinkError,
  ConfirmPractitionerError,
} from 'src/thingsboard/domain/errors/thingsboard.errors';
import { AxiosError } from 'axios';
import { ThingsboardModel } from '../../../domain/models/thingsboard.model';
import { JwtPayload } from '../../../thingsboard.types';
import { ConfirmPractitionerResponseDto } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-confirm-practitioner.response.dto';
import { ConfirmPractitionerCommand } from './confirm-practitioner-tenant.command';
import { ConnectionRepository } from 'src/connection/domain/repositories/connection.repository';
import {
  THINGSBOARD_REPOSITORY_PORT,
  ThingsboardRepositoryPort,
} from '../../ports/thingsboard.repository.port';

@CommandHandler(ConfirmPractitionerCommand)
export class ConfirmPractitionerCommandHandler implements ICommandHandler<
  ConfirmPractitionerCommand,
  Result<ConfirmPractitionerResponseDto, ConfirmPractitionerError>
> {
  private readonly logger = new Logger(ConfirmPractitionerCommandHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
    private readonly configService: ConfigService,
    @Inject(ConnectionRepository)
    private readonly connectionRepository: ConnectionRepository,
    @Inject(THINGSBOARD_REPOSITORY_PORT)
    private readonly thingsboardRepository: ThingsboardRepositoryPort,
  ) {}

  private get THINGSBOARD_SYSADMIN_EMAIL(): string {
    return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_EMAIL');
  }

  private get THINGSBOARD_SYSADMIN_PASSWORD(): string {
    return this.configService.getOrThrow<string>(
      'THINGSBOARD_SYSADMIN_PASSWORD',
    );
  }

  async execute(
    command: ConfirmPractitionerCommand,
  ): Promise<Result<ConfirmPractitionerResponseDto, ConfirmPractitionerError>> {
    const { formFields, tenantId, userId, uow } = command;
    // const { userFields, tenantFields } = formData;
    const { password, confirmPassword } = formFields;

    this.logger.log('Starting ThingsBoard tenant registration process');
    this.logger.log('Form fields:', formFields);
    this.logger.log('Tenant ID:', tenantId);
    this.logger.log('User ID:', userId);

    // Validate passwords
    this.logger.log('Validating passwords');
    if (password !== confirmPassword) {
      this.logger.error('Passwords do not match');
      return Err(new PasswordMismatchError());
    }
    this.logger.log('Passwords validated successfully');

    let sysAdminAccessToken: string | undefined = undefined;
    // let tenantId: EntityId | null = null;
    let thingsboardUserId: string | null = null;

    try {
      // Step 0: Authenticate sysadmin
      this.logger.log('Step 0: Authenticating sysadmin');
      const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
        this.THINGSBOARD_SYSADMIN_EMAIL,
        this.THINGSBOARD_SYSADMIN_PASSWORD,
      );
      this.logger.log('Sysadmin login response:', loginResponse);

      sysAdminAccessToken = loginResponse.token;
      this.logger.log('Sysadmin access token obtained');

      // Step 1: Create tenant
      // this.logger.log('Step 1: Creating tenant');
      // const tenantProfileId =
      //   await this.thingsboardApi.getDefaultTenantProfile(sysAdminAccessToken);
      // tenantId = await this.thingsboardApi.createTenant(
      //   tenantFields,
      //   tenantProfileId,
      //   sysAdminAccessToken,
      // );

      // Step 1: Create tenant admin
      this.logger.log('Step 1: Creating tenant admin');
      // Decode token to get customerId
      const decoded = JSON.parse(
        Buffer.from(sysAdminAccessToken.split('.')[1], 'base64').toString(),
      ) as JwtPayload;
      this.logger.debug('Decoded JWT payload:', decoded);
      thingsboardUserId = await this.thingsboardApi.createTenantAdmin(
        {
          ...formFields,
          password: formFields.password!,
          confirmPassword: formFields.confirmPassword!,
        },
        { entityType: 'TENANT', id: tenantId },
        decoded.customerId,
        sysAdminAccessToken,
      );
      this.logger.log('Tenant admin created with ID:', thingsboardUserId);

      // Step 3: Create thingsboard connection in database
      this.logger.log('Step 3: Creating thingsboard entity in database');
      const connection =
        await uow.connectionRepository.getOrCreateByUserId(userId);
      this.logger.debug('User connection:', connection);

      if (!connection) {
        this.logger.error('Connection entity not found for user:', userId);
        return Err(new TenantCreationError('Connection entity not found'));
      }
      if (connection.thingsboardId) {
        this.logger.warn(
          'Thingsboard connection already exists for user:',
          userId,
        );
        return Err(new ThingsboardConnectionExistsError());
      }

      this.logger.debug('Creating ThingsboardModel with:', {
        tenantTitle: tenantId,
        tenantId: tenantId,
        connection: connection,
      });
      const thingsboardModel = ThingsboardModel.create(
        tenantId,
        tenantId,
        connection,
      );
      this.logger.debug('Created ThingsboardModel:', thingsboardModel);
      const savedThingsboard =
        await uow.thingsboardRepository.save(thingsboardModel);
      this.logger.log(
        'Saved ThingsboardModel to repository:',
        savedThingsboard,
      );

      // Refresh connection from database to reflect thingsboardId
      const refreshedConnection =
        await uow.connectionRepository.getConnectionByUserId(userId);
      this.logger.log(
        'Refreshed connection with thingsboardId:',
        refreshedConnection,
      );

      // Step 4: Get activation link
      this.logger.log('Step 4: Getting user activation link');
      const activationLink = await this.thingsboardApi.getUserActivationLink(
        thingsboardUserId,
        sysAdminAccessToken,
      );
      this.logger.log('Activation link obtained:', activationLink);

      // Step 5: Activate tenant admin
      this.logger.log('Step 5: Activating tenant admin');
      const activationToken = this.extractActivationToken(activationLink);
      this.logger.log('Extracted activation token');
      const activationResponse = await this.thingsboardApi.activateTenantAdmin(
        activationToken,
        password!,
      );
      this.logger.log('Tenant admin activated successfully');

      // // Step 6: Create base rule chain
      // this.logger.log('Step 6: Creating base rule chain');
      // const ruleChainId = await this.createBaseRuleChain(
      //   activationResponse.token,
      // );

      // // Step 7: Set rule chain as default
      // this.logger.log('Step 7: Setting rule chain as default');
      // await this.setRuleChainAsDefault(activationResponse.token, ruleChainId);

      // Step 8: Save tokens to database
      this.logger.log('Step 8: Saving tokens to database');
      const updatedModel = await uow.thingsboardRepository.findByUserId(userId);
      this.logger.debug('Found thingsboard model:', updatedModel);
      if (updatedModel) {
        this.logger.log('Updating tokens for user:', userId);
        updatedModel.setAccessToken(activationResponse.token);
        updatedModel.setRefreshToken(activationResponse.refreshToken);
        await uow.thingsboardRepository.update(updatedModel);
        this.logger.log('Tokens updated successfully');
      }

      this.logger.log('ThingsBoard tenant registration completed successfully');

      return Ok({
        success: true,
        tenantId: tenantId,
        accessToken: activationResponse.token,
        refreshToken: activationResponse.refreshToken,
        message: 'Practitioner (Tenant admin) created successfully',
        rollbackData: {
          tenantId: tenantId,
          userId: thingsboardUserId,
          sysAdminAccessToken: sysAdminAccessToken,
        },
      });
    } catch (error) {
      this.logger.error('Error during tenant registration:', error.message);

      // Rollback changes
      await this.rollbackChanges(
        { entityType: 'TENANT', id: tenantId },
        thingsboardUserId,
        sysAdminAccessToken,
      );

      return this.handleError(error);
    }
  }

  private extractActivationToken(activationLink: string): string {
    try {
      const parsed = new URL(activationLink);
      const token = parsed.searchParams.get('activateToken');
      if (!token) {
        throw new Error('No activateToken parameter found');
      }
      return token;
    } catch {
      this.logger.warn(`Failed to parse activation URL: ${activationLink}`);
      throw new InvalidActivationLinkError();
    }
  }

  private async rollbackChanges(
    tenantId: EntityId | null,
    userId: string | null,
    sysAdminAccessToken?: string,
  ): Promise<void> {
    this.logger.warn('Starting rollback of changes');

    if (!sysAdminAccessToken || !userId) {
      this.logger.warn('No sysadmin token or tenant admin ID for rollback');
      return;
    }

    try {
      this.logger.log(`Rolling back: Deleting tenant admin ${userId}`);
      await this.thingsboardApi.deleteTenantAdmin(userId, sysAdminAccessToken);
      this.logger.log('DELETE TENANT ADMIN SUCCESSFUL');
    } catch (rollbackError) {
      this.logger.error(
        'Failed to rollback changes, maybe tenant admin was not even created:',
        rollbackError,
      );
    }
  }

  private handleError(error: unknown): Result<never, ConfirmPractitionerError> {
    if (
      error instanceof PasswordMismatchError ||
      error instanceof UserAlreadyExistsError ||
      error instanceof ThingsboardConnectionExistsError ||
      error instanceof UserActivationError ||
      error instanceof InvalidActivationLinkError ||
      error instanceof TenantCreationError
    ) {
      return Err(error as unknown as ConfirmPractitionerError);
    }

    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      this.logger.error('AxiosError details:', { status, message });

      if (status === 400) {
        if (message?.includes('email') || message?.includes('E-mail')) {
          const err = new UserAlreadyExistsError(message);
          this.logger.error('UserAlreadyExistsError with message:', message);
          return Err(err as unknown as ConfirmPractitionerError);
        }
        const err = new TenantCreationError(message);
        this.logger.error('TenantCreationError with message:', message);
        return Err(err as unknown as ConfirmPractitionerError);
      }

      if (status === 401) {
        const err = new TenantCreationError('Authentication failed');
        return Err(err as unknown as ConfirmPractitionerError);
      }
    }

    // Handle ThingsboardApiException from API adapter
    if (error instanceof Error && error.name === 'ThingsboardApiException') {
      this.logger.error('ThingsboardApiException caught:', error.message);
      return Err(
        new TenantCreationError(
          error.message,
        ) as unknown as ConfirmPractitionerError,
      );
    }

    return Err(
      new TenantCreationError(
        'Unknown error during registration',
      ) as unknown as ConfirmPractitionerError,
    );
  }
}
