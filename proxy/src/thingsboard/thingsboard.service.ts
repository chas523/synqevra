import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import {
  TenantFieldsDto,
  ThingsboardConnectionFormDto,
} from './dtos/thingsboardConnectionForm.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { AxiosError } from 'axios';
import { getErrorStatus, getErrorMessage } from './../utils/error.utils';
import { ConfigService } from '@nestjs/config';
import {
  EntityId,
  JwtPayload,
  ThingsboardDefaultTenantProfileResponse,
  ThingsboardLoginResponse,
  CreateRuleChainRequest,
  RuleChainMetadata,
  RuleChain,
  DeviceProfile,
} from './thingsboard.types';
import { ConnectionService } from 'src/connection/connection.service';
import { Thingsboard } from 'src/entities/thingsboard.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class ThingsboardService {
  private readonly logger = new Logger(ThingsboardService.name);

  constructor(
    @InjectRepository(Thingsboard)
    private readonly thingsboardRepository: Repository<Thingsboard>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ConnectionService))
    private readonly connectionService: ConnectionService,
  ) {}

  private get THINGSBOARD_SYSADMIN_EMAIL(): string {
    return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_EMAIL');
  }

  private get THINGSBOARD_SYSADMIN_PASSWORD(): string {
    return this.configService.getOrThrow<string>(
      'THINGSBOARD_SYSADMIN_PASSWORD',
    );
  }
  private get THINGSBOARD_API_URL(): string {
    return (
      this.configService.getOrThrow<string>('THINGSBOARD_API_URL') + '/api'
    );
  }

  async createThingsboardConnection(
    userId: number,
    projectName: string,
    thingsboardRepo?: Repository<Thingsboard>,
    connectionRepo?: Repository<any>,
  ) {
    // Używamy custom repozytoriów jeśli są przekazane (transakcja), w przeciwnym razie domyślne
    const thingsboardRepository = thingsboardRepo || this.thingsboardRepository;
    const connection = await this.connectionService.getOrCreateUserConnection(
      userId,
      connectionRepo,
    );
    if (!connection) {
      throw new NotFoundException('User connection not found');
    }
    if (connection.thingsboard) {
      throw new BadRequestException(
        'Thingsboard connection already exists for this user',
      );
    }
    const thingsboardEntity = thingsboardRepository.create({
      project: projectName,
      connection: connection,
    });
    return await thingsboardRepository.save(thingsboardEntity);
  }

  public async connectRegisterToThingsboard(
    formData: ThingsboardConnectionFormDto,
    userId: number,
    thingsboardRepo?: Repository<Thingsboard>,
    connectionRepo?: Repository<any>,
  ) {
    this.logger.log('Starting ThingsBoard tenant registration process');

    //validate input data
    this.validateInput(formData);

    const { userFields, tenantFields } = formData;
    const { password, ...userData } = userFields;

    let sysAdminAccessToken: string | undefined = undefined;
    let tenantId: EntityId | null = null;
    const thingsboardUserId: string | null = null;

    try {
      //create thingsboard connection inside our database
      this.logger.log('Step 0: Create thingsboard entity inside our database');
      await this.createThingsboardConnection(
        userId,
        tenantFields.title,
        thingsboardRepo,
        connectionRepo,
      );

      //sysadmin login (get his access token)
      this.logger.log('Step 1: Authenticating sysadmin');
      sysAdminAccessToken = await this.loginToThingsboardWithSysadminAccount();

      //create tenant (eg. hospital)
      this.logger.log('Step 2: Creating tenant');
      tenantId = await this.addTenant(tenantFields, sysAdminAccessToken);

      //create tenant admin
      this.logger.log('Step 3: Creating tenant admin');
      const newUserId = await this.addTenantAdmin(
        userData,
        tenantId,
        sysAdminAccessToken,
      );

      //get new user activation link
      this.logger.log('Step 4: Get new user activation link');
      const activationLink = await this.getNewUserActivationLink(
        newUserId,
        sysAdminAccessToken,
      );

      //set tenant admin password
      this.logger.log('Step 5: Setting tenant admin password');
      const result = await this.createTenantAdminPassword(
        activationLink,
        sysAdminAccessToken,
        password,
      );

      //create base rule chain
      this.logger.log('Step 6: Creating base rule chain');
      const newRuleChainId = await this.createBaseRuleChain(result.token);

      //set rule chain as default for device profile
      this.logger.log(
        'Step 7: Setting rule chain as default for device profile',
      );
      await this.setRuleChainAsDefaultForDeviceProfile(
        result.token,
        newRuleChainId,
      );

      this.logger.log('ThingsBoard tenant registration completed successfully');
      return {
        success: true,
        tenantId: result.tenantId,
        accessToken: result.token,
        refreshToken: result.refreshToken,
        message: 'Tenant and admin user created successfully',
        // Rollback data for external use
        rollbackData: {
          tenantId: tenantId,
          userId: thingsboardUserId,
          sysAdminAccessToken: sysAdminAccessToken,
        },
      };
    } catch (error: unknown) {
      this.logger.error('Error during tenant registration:', error);

      //in case of error we're deleting the tenant (and all its content)
      await this.rollbackChanges(
        tenantId,
        thingsboardUserId,
        sysAdminAccessToken,
      );

      const status = getErrorStatus(error);

      this.logger.debug(`Determined error status: ${status}`);

      const errorMessage = getErrorMessage(error);

      this.logger.debug(`Determined errorMessage: ${errorMessage}`);

      if (status === 400) {
        throw new BadRequestException(errorMessage);
      } else if (status === 401) {
        throw new BadRequestException('Authentication failed');
      } else {
        throw new InternalServerErrorException(
          'Failed to create tenant and user',
        );
      }
    }
  }

  private validateInput(formData: ThingsboardConnectionFormDto) {
    if (!formData.tenantFields?.title) {
      throw new BadRequestException('Tenant title is required');
    }
    if (!formData.userFields?.userEmail) {
      throw new BadRequestException('User email is required');
    }
    if (
      !formData.userFields?.password ||
      formData.userFields.password.length < 6
    ) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }
    if (formData.userFields.password !== formData.userFields.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
  }

  private async rollbackChanges(
    tenantId: EntityId | null,
    userId: string | null,
    sysAdminAccessToken?: string,
  ) {
    this.logger.warn('Starting rollback of changes');

    if (!sysAdminAccessToken) {
      this.logger.warn('No sysadmin token available for rollback');
      return;
    }

    try {
      //delete tenant (and all it's content - users)
      if (tenantId) {
        this.logger.log(`Rolling back: Deleting tenant ${tenantId.id}`);
        await this.deleteTenant(tenantId.id, sysAdminAccessToken);
      }
    } catch (rollbackError) {
      this.logger.error('Failed to rollback changes:', rollbackError);
    }
  }

  // Public method to allow external rollback calls
  public async performRollback(
    tenantId: EntityId | null,
    userId: string | null,
    sysAdminAccessToken?: string,
  ) {
    return await this.rollbackChanges(tenantId, userId, sysAdminAccessToken);
  }

  private async createBaseRuleChain(accessToken: string) {
    try {
      //load base rule chain configuration
      const baseRuleChainPath = path.join(
        process.cwd(),
        'src',
        'thingsboard',
        'base_rule_chain.json',
      );
      console.log('Bserulechain:', baseRuleChainPath);
      const baseRuleChainData = JSON.parse(
        fs.readFileSync(baseRuleChainPath, 'utf8'),
      ) as RuleChain;
      //create rule chain
      const createRuleChainRequest: CreateRuleChainRequest = {
        name: baseRuleChainData.ruleChain.name,
        type: baseRuleChainData.ruleChain.type,
        debugMode: baseRuleChainData.ruleChain.debugMode,
      };

      const createRuleChainUrl = `${this.THINGSBOARD_API_URL}/ruleChain`;
      const ruleChainResponse = await firstValueFrom(
        this.httpService.post<{ id: EntityId }>(
          createRuleChainUrl,
          createRuleChainRequest,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );

      const ruleChainId = ruleChainResponse.data.id;
      this.logger.log(`Created rule chain with ID: ${ruleChainId.id}`);

      //update rule chain metadata
      const ruleChainMetadata: RuleChainMetadata = {
        ruleChainId: ruleChainId,
        firstNodeIndex: baseRuleChainData.metadata.firstNodeIndex,
        nodes: baseRuleChainData.metadata.nodes,
        connections: baseRuleChainData.metadata.connections,
        ruleChainConnections: baseRuleChainData.metadata.ruleChainConnections,
      };

      const updateMetadataUrl = `${this.THINGSBOARD_API_URL}/ruleChain/metadata`;
      await firstValueFrom(
        this.httpService.post(updateMetadataUrl, ruleChainMetadata, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      this.logger.log('Successfully updated rule chain metadata');
      return ruleChainId;
    } catch (error) {
      this.logger.error('Failed to create base rule chain:', error);
      throw new InternalServerErrorException(
        'Failed to create base rule chain',
      );
    }
  }

  private async setRuleChainAsDefaultForDeviceProfile(
    accessToken: string,
    ruleChainId: EntityId,
  ) {
    try {
      //get default device profile info
      const deviceProfileInfoUrl = `${this.THINGSBOARD_API_URL}/deviceProfileInfo/default`;
      const deviceProfileInfoResponse = await firstValueFrom(
        this.httpService.get<{ id: EntityId }>(deviceProfileInfoUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      const deviceProfileId = deviceProfileInfoResponse.data.id;
      this.logger.log(`Got default device profile ID: ${deviceProfileId.id}`);

      //get full device profile data
      const deviceProfileUrl = `${this.THINGSBOARD_API_URL}/deviceProfile/${deviceProfileId.id}`;
      const deviceProfileResponse = await firstValueFrom(
        this.httpService.get<DeviceProfile>(deviceProfileUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      const deviceProfile = deviceProfileResponse.data;
      this.logger.log('Retrieved device profile data');

      //update device profile with default rule chain
      const updatedDeviceProfile: DeviceProfile = {
        ...deviceProfile,
        defaultRuleChainId: {
          entityType: 'RULE_CHAIN',
          id: ruleChainId.id,
        },
      };

      const updateDeviceProfileUrl = `${this.THINGSBOARD_API_URL}/deviceProfile`;
      await firstValueFrom(
        this.httpService.post(updateDeviceProfileUrl, updatedDeviceProfile, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      this.logger.log(
        'Successfully set rule chain as default for device profile',
      );
    } catch (error) {
      this.logger.error(
        'Failed to set rule chain as default for device profile:',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to set rule chain as default for device profile',
      );
    }
  }

  private async deleteTenant(tenantId: string, sysAdminAccessToken: string) {
    try {
      const url = `${this.THINGSBOARD_API_URL}/tenant/${tenantId}`;
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      this.logger.log(`Tenant ${tenantId} deleted successfully`);
    } catch (error) {
      this.logger.error(`Failed to delete tenant ${tenantId}:`, error);
      throw error;
    }
  }

  private async loginToThingsboardWithSysadminAccount() {
    const url = `${this.THINGSBOARD_API_URL}/auth/login`;
    const body = {
      username: this.THINGSBOARD_SYSADMIN_EMAIL,
      password: this.THINGSBOARD_SYSADMIN_PASSWORD,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<ThingsboardLoginResponse>(url, body),
      );
      return response.data.token;
    } catch (error) {
      this.logger.error('Failed to authenticate sysadmin:', error);
      throw new InternalServerErrorException(
        'Failed to authenticate with ThingsBoard',
      );
    }
  }

  private async addTenant(
    tenantFields: TenantFieldsDto,
    sysAdminAccessToken: string,
  ) {
    try {
      const defaultTenantProfile =
        await this.getDefaultTenantProfile(sysAdminAccessToken);

      const apiBody = {
        ...tenantFields,
        email: tenantFields.tenantEmail,
        zip: tenantFields.zipCode,
        tenantProfileId: defaultTenantProfile,
        additionalInfo: {
          description: tenantFields.description,
        },
      };

      const url = `${this.THINGSBOARD_API_URL}/tenant`;
      const newTenant = await firstValueFrom(
        this.httpService.post<{ id: EntityId }>(url, apiBody, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return newTenant.data.id;
    } catch (error) {
      this.logger.error('Failed to create tenant:', error);
      throw new InternalServerErrorException('Failed to create tenant');
    }
  }

  private async getDefaultTenantProfile(sysAdminAccessToken: string) {
    try {
      const url = `${this.THINGSBOARD_API_URL}/tenantProfileInfo/default`;
      const response = await firstValueFrom(
        this.httpService.get<ThingsboardDefaultTenantProfileResponse>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data.id;
    } catch (error) {
      this.logger.error('Failed to get default tenant profile:', error);
      throw new InternalServerErrorException(
        'Failed to get default tenant profile',
      );
    }
  }
  private async addTenantAdmin(
    userData: {
      userEmail: string;
      firstName?: string | undefined;
      lastName?: string | undefined;
      userPhone?: string | undefined;
      userDescription?: string | undefined;
    },
    tenantId: EntityId,
    sysAdminAccessToken: string,
  ) {
    try {
      const url = `${this.THINGSBOARD_API_URL}/user?sendActivationMail=false`;

      const decodedToken = jwt.decode(sysAdminAccessToken) as JwtPayload;

      const body = {
        email: userData.userEmail,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.userPhone,
        additionalInfo: {
          description: userData.userDescription,
          defaultDashboardId: null,
          defaultDashboardFullscreen: false,
          homeDashboardId: null,
          homeDashboardHideToolbar: true,
        },
        authority: 'TENANT_ADMIN',
        tenantId: tenantId,
        customerId: {
          entityType: 'CUSTOMER',
          id: decodedToken.customerId,
        },
      };
      const response = await firstValueFrom(
        this.httpService.post<{ id: EntityId }>(url, body, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data.id.id;
    } catch (error) {
      let status: number | undefined;
      if (error && (error as AxiosError).isAxiosError) {
        const resp = (error as AxiosError).response;
        status = resp?.status;
      }

      if (status === 400) {
        throw new BadRequestException('E-mail is used.');
      }
      this.logger.error('Failed to create tenant admin:', error);
      throw new InternalServerErrorException('Failed to create tenant admin');
    }
  }

  private async getNewUserActivationLink(
    newUserId: string,
    sysAdminAccessToken: string,
  ) {
    const url = `${this.THINGSBOARD_API_URL}/user/${newUserId}/activationLinkInfo`;

    const response = await firstValueFrom(
      this.httpService.get<{ value: string }>(url, {
        headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
      }),
    );
    return response.data.value;
  }

  private async createTenantAdminPassword(
    activationLink: string,
    sysAdminAccessToken: string,
    password: string,
  ) {
    const url = `${this.THINGSBOARD_API_URL}/noauth/activate?sendActivationMail=true`;

    let activateToken = activationLink;
    try {
      const parsed = new URL(activationLink);
      const param = parsed.searchParams.get('activateToken');

      if (param) {
        activateToken = param;
      } else {
        throw new Error('No activateToken parameter found in URL');
      }
    } catch (error) {
      this.logger.warn(
        `Failed to parse activation URL: ${activationLink} - ${error}`,
      );
      throw new BadRequestException('Invalid activation link format');
    }

    const body = {
      activateToken: activateToken,
      password: password,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<ThingsboardLoginResponse>(url, body, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      const decodedToken = jwt.decode(response.data.token) as JwtPayload;
      return {
        ...response.data,
        tenantId: decodedToken.tenantId,
      };
    } catch (error) {
      this.logger.error('Failed to activate tenant admin:', error);
      throw new InternalServerErrorException(
        'Failed to activate tenant admin account',
      );
    }
  }
}
