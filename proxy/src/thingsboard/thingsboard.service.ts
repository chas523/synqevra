import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
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

interface ThingsboardLoginResponse {
  token: string;
  refreshToken: string;
}
interface ThingsboardDefaultTenantProfileResponse {
  id: {
    entityType: string;
    id: string;
  };
  name: string;
}

interface EntityId {
  entityType: string;
  id: string;
}

interface JwtPayload {
  customerId: string;
  tenantId: string;
  userId: string;
}
interface EntityId {
  entityType: string;
  id: string;
}
@Injectable()
export class ThingsboardService {
  private readonly logger = new Logger(ThingsboardService.name);

  constructor(private readonly httpService: HttpService) {}

  private readonly THINGSBOARD_SYSADMIN_EMAIL = 'sysadmin@thingsboard.org';
  private readonly THINGSBOARD_SYSADMIN_PASSWORD = 'sysadmin';
  private readonly THINGSBOARD_API_URL = 'http://localhost:8088/api';

  public async connectRegisterToThingsboard(
    formData: ThingsboardConnectionFormDto,
  ) {
    this.logger.log('Starting ThingsBoard tenant registration process');

    //validate input data
    this.validateInput(formData);

    const { userFields, tenantFields } = formData;
    const { password, ...userData } = userFields;

    let sysAdminAccessToken: string | undefined = undefined;
    let tenantId: EntityId | null = null;
    const userId: string | null = null;

    try {
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

      this.logger.log('ThingsBoard tenant registration completed successfully');
      return {
        success: true,
        tenantId: result.tenantId,
        accessToken: result.token,
        refreshToken: result.refreshToken,
        message: 'Tenant and admin user created successfully',
      };
    } catch (error: unknown) {
      this.logger.error('Error during tenant registration:', error);

      //in case of error we're deleting the tenant (and all its content)
      await this.rollbackChanges(tenantId, userId, sysAdminAccessToken);

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
      //   if (!activationLink.includes('http')) {
      //     activateToken = activationLink;
      //   } else {
      throw new BadRequestException('Invalid activation link format');
      //   }
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
