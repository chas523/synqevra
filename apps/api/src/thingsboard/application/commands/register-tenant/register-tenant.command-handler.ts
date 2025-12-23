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
import { RegisterTenantCommand } from './register-tenant.command';
import { RegisterTenantResponseDto } from 'src/thingsboard/interface/rest/dtos/response/register-tenant.response.dto';
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
} from 'src/thingsboard/domain/errors/thingsboard.errors';
import { AxiosError } from 'axios';
import { ThingsboardModel } from '../../../domain/models/thingsboard.model';
import { JwtPayload } from '../../../thingsboard.types';

interface RuleChainData {
  ruleChain: {
    name: string;
    type: string;
    debugMode: boolean;
  };
  metadata: {
    firstNodeIndex: number | null;
    nodes: any[];
    connections: any[];
    ruleChainConnections: null;
  };
}

@CommandHandler(RegisterTenantCommand)
export class RegisterTenantCommandHandler implements ICommandHandler<
  RegisterTenantCommand,
  Result<RegisterTenantResponseDto, RegisterTenantError>
> {
  private readonly logger = new Logger(RegisterTenantCommandHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
    private readonly configService: ConfigService,
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
    command: RegisterTenantCommand,
  ): Promise<Result<RegisterTenantResponseDto, RegisterTenantError>> {
    const { userId, formData, uow } = command;
    const { userFields, tenantFields } = formData;
    const { password, confirmPassword } = userFields;

    this.logger.log('Starting ThingsBoard tenant registration process');

    // Validate passwords
    if (password !== confirmPassword) {
      return Err(new PasswordMismatchError());
    }

    let sysAdminAccessToken: string | undefined = undefined;
    let tenantId: EntityId | null = null;
    let thingsboardUserId: string | null = null;

    try {
      // Step 0: Authenticate sysadmin
      this.logger.log('Step 0: Authenticating sysadmin');
      const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
        this.THINGSBOARD_SYSADMIN_EMAIL,
        this.THINGSBOARD_SYSADMIN_PASSWORD,
      );

      sysAdminAccessToken = loginResponse.token;

      // Step 1: Create tenant
      this.logger.log('Step 1: Creating tenant');
      const tenantProfileId =
        await this.thingsboardApi.getDefaultTenantProfile(sysAdminAccessToken);
      tenantId = await this.thingsboardApi.createTenant(
        tenantFields,
        tenantProfileId,
        sysAdminAccessToken,
      );

      // Step 2: Create tenant admin
      this.logger.log('Step 2: Creating tenant admin');
      // Decode token to get customerId
      const decoded = JSON.parse(
        Buffer.from(sysAdminAccessToken.split('.')[1], 'base64').toString(),
      ) as JwtPayload;
      thingsboardUserId = await this.thingsboardApi.createTenantAdmin(
        userFields,
        tenantId,
        decoded.customerId,
        sysAdminAccessToken,
      );

      // Step 3: Create thingsboard connection in database
      this.logger.log('Step 3: Creating thingsboard entity in database');
      const connection =
        await uow.connectionRepository.getOrCreateByUserId(userId);
      this.logger.debug('User connection:', connection);

      if (!connection) {
        return Err(new TenantCreationError('Connection entity not found'));
      }
      if (connection.thingsboardId) {
        return Err(new ThingsboardConnectionExistsError());
      }
      this.logger.debug('Creating ThingsboardModel with:', {
        project: tenantFields.title,
        tenantId: tenantId.id,
        connection,
      });
      const thingsboardModel = ThingsboardModel.create(
        tenantFields.title,
        tenantId.id,
        connection,
      );
      this.logger.debug('Created ThingsboardModel:', thingsboardModel);
      await uow.thingsboardRepository.save(thingsboardModel);
      this.logger.debug('Saved ThingsboardModel to repository');

      // Step 4: Get activation link
      this.logger.log('Step 4: Getting user activation link');
      const activationLink = await this.thingsboardApi.getUserActivationLink(
        thingsboardUserId,
        sysAdminAccessToken,
      );

      // Step 5: Activate tenant admin
      this.logger.log('Step 5: Activating tenant admin');
      const activationToken = this.extractActivationToken(activationLink);
      const activationResponse = await this.thingsboardApi.activateTenantAdmin(
        activationToken,
        password,
      );

      // Step 6: Create base rule chain
      this.logger.log('Step 6: Creating base rule chain');
      const ruleChainId = await this.createBaseRuleChain(
        activationResponse.token,
      );

      // Step 7: Set rule chain as default
      this.logger.log('Step 7: Setting rule chain as default');
      await this.setRuleChainAsDefault(activationResponse.token, ruleChainId);

      // Step 8: Save tokens to database
      this.logger.log('Step 8: Saving tokens to database');
      const updatedModel = await uow.thingsboardRepository.findByUserId(userId);
      if (updatedModel) {
        updatedModel.setAccessToken(activationResponse.token);
        updatedModel.setRefreshToken(activationResponse.refreshToken);
        await uow.thingsboardRepository.update(updatedModel);
      }

      this.logger.log('ThingsBoard tenant registration completed successfully');

      return Ok({
        success: true,
        tenantId: tenantId.id,
        accessToken: activationResponse.token,
        refreshToken: activationResponse.refreshToken,
        message: 'Tenant and admin user created successfully',
        rollbackData: {
          tenantId: tenantId.id,
          userId: thingsboardUserId,
          sysAdminAccessToken: sysAdminAccessToken,
        },
      });
    } catch (error) {
      this.logger.error('Error during tenant registration:', error);

      // Rollback changes
      await this.rollbackChanges(
        tenantId,
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

  private async createBaseRuleChain(accessToken: string): Promise<EntityId> {
    try {
      const baseRuleChainPath = path.join(
        process.cwd(),
        'dist',
        'base_rule_chain.json',
      );

      const baseRuleChainData: RuleChainData = JSON.parse(
        fs.readFileSync(baseRuleChainPath, 'utf8'),
      );

      const ruleChainId = await this.thingsboardApi.createRuleChain(
        baseRuleChainData.ruleChain.name,
        baseRuleChainData.ruleChain.type,
        baseRuleChainData.ruleChain.debugMode,
        accessToken,
      );

      await this.thingsboardApi.updateRuleChainMetadata(
        ruleChainId,
        baseRuleChainData.metadata,
        accessToken,
      );

      return ruleChainId;
    } catch (error) {
      this.logger.error('Failed to create base rule chain:', error);
      throw new RuleChainCreationError();
    }
  }

  private async setRuleChainAsDefault(
    accessToken: string,
    ruleChainId: EntityId,
  ): Promise<void> {
    try {
      const deviceProfileId =
        await this.thingsboardApi.getDefaultDeviceProfile(accessToken);
      const deviceProfile = await this.thingsboardApi.getDeviceProfile(
        deviceProfileId.id,
        accessToken,
      );

      const updatedProfile = {
        ...deviceProfile,
        defaultRuleChainId: {
          entityType: 'RULE_CHAIN',
          id: ruleChainId.id,
        },
      };

      await this.thingsboardApi.updateDeviceProfile(
        updatedProfile,
        accessToken,
      );
    } catch (error) {
      this.logger.error('Failed to set rule chain as default:', error);
      throw new DeviceProfileUpdateError();
    }
  }

  private async rollbackChanges(
    tenantId: EntityId | null,
    userId: string | null,
    sysAdminAccessToken?: string,
  ): Promise<void> {
    this.logger.warn('Starting rollback of changes');

    if (!sysAdminAccessToken || !tenantId) {
      this.logger.warn('No sysadmin token or tenant ID for rollback');
      return;
    }

    try {
      this.logger.log(`Rolling back: Deleting tenant ${tenantId.id}`);
      await this.thingsboardApi.deleteTenant(tenantId.id, sysAdminAccessToken);
    } catch (rollbackError) {
      this.logger.error('Failed to rollback changes:', rollbackError);
    }
  }

  private handleError(error: unknown): Result<never, RegisterTenantError> {
    if (
      error instanceof PasswordMismatchError ||
      error instanceof UserAlreadyExistsError ||
      error instanceof ThingsboardConnectionExistsError ||
      error instanceof RuleChainCreationError ||
      error instanceof RuleChainConfigurationError ||
      error instanceof DeviceProfileUpdateError ||
      error instanceof UserActivationError ||
      error instanceof InvalidActivationLinkError
    ) {
      return Err(error);
    }

    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 400) {
        if (message?.includes('email') || message?.includes('E-mail')) {
          return Err(new UserAlreadyExistsError(message));
        }
        return Err(new TenantCreationError(message));
      }

      if (status === 401) {
        return Err(new TenantCreationError('Authentication failed'));
      }
    }

    return Err(new TenantCreationError('Unknown error during registration'));
  }
}
