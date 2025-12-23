import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  EntityId,
  ThingsboardApiPort,
  ThingsboardLoginResponse,
  UserResponse,
} from 'src/thingsboard/application/ports/thingsboard.api.port';
import { DevicesResponse } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-devices.response.dto';
import {
  MedplumApiError,
  ThingsboardApiException,
} from './thingsboard.http.errors';
import { DeviceDetails } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-device.response.dto';
import { CreateDeviceRequest } from 'src/thingsboard/interface/rest/dtos/request/thingsboard-device.request.dto';
import { Device } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-created-device.response.dto';
import { DeviceAttributes } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-device-attributes.response.dto';
import { CreateTenantRequestDto } from 'src/thingsboard/interface/rest/dtos/request/create-tenant.request.dto';
import { CreateTenantAdminRequestDto } from 'src/thingsboard/interface/rest/dtos/request/create-tenant-admin.request.dto';
import * as jwt from 'jsonwebtoken';
import { MedplumClientPort } from '../../../medplum/application/ports/medplum-client.port';
import { ExpiredTokenError } from 'src/thingsboard/domain/errors/thingsboard.errors';
import {
  THINGSBOARD_REPOSITORY_PORT,
  ThingsboardRepositoryPort,
} from 'src/thingsboard/application/ports/thingsboard.repository.port';

interface JwtPayload {
  customerId: string;
  tenantId: string;
  userId: string;
}

@Injectable()
export class ThingsboardApiAdapter implements ThingsboardApiPort {
  private readonly logger = new Logger(ThingsboardApiAdapter.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly medplum: MedplumClientPort,
    @Inject(THINGSBOARD_REPOSITORY_PORT)
    private readonly thingsboardRepository: ThingsboardRepositoryPort,
  ) {}

  private get THINGSBOARD_API_URL(): string {
    return (
      this.configService.getOrThrow<string>('THINGSBOARD_API_URL') + '/api'
    );
  }

  async fetchDevices(
    accessToken: string,
    page: number,
    pageSize: number,
  ): Promise<DevicesResponse> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/tenant/deviceInfos?pageSize=${pageSize}&page=${page}&sortProperty=createdTime&sortOrder=DESC`;
      const response = await firstValueFrom(
        this.httpService.get<DevicesResponse>(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch devices from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async fetchDevice(accessToken: string, id: string): Promise<DeviceDetails> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/device/info/${id}`;
      const response = await firstValueFrom(
        this.httpService.get<DeviceDetails>(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch device from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }
  async createDevice(
    accessToken: string,
    payload: CreateDeviceRequest,
    userId: number,
  ): Promise<Device> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/device`;
      const response = await firstValueFrom(
        this.httpService.post<Device>(url, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      try {
        await this.medplum.createDevice(
          {
            identifier: response.data.id.id,
          },
          userId,
        );
      } catch (medplumError) {
        //if medplum fails - we're rollbacking creation of thingsboard device
        await this.deleteDevice(accessToken, response.data.id.id);
        this.logger.error('Failed to create medplum device:', medplumError);
        MedplumApiError.createException(
          'Failed to fetch device from ThingsBoard API',
          medplumError,
        );
      }
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch device from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async deleteDevice(accessToken: string, id: string): Promise<void> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/device/${id}`;
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to delete device from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async fetchDeviceSharedAttributes(
    accessToken: string,
    id: string,
  ): Promise<DeviceAttributes> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/plugins/telemetry/DEVICE/${id}/values/attributes/SHARED_SCOPE`;
      const response = await firstValueFrom(
        this.httpService.get<DeviceAttributes>(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to delete device from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async updateDeviceSharedAttributes(
    accessToken: string,
    id: string,
    attributes: Record<string, any>,
  ): Promise<void> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/plugins/telemetry/DEVICE/${id}/SHARED_SCOPE`;
      await firstValueFrom(
        this.httpService.post(url, attributes, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to update device shared attributes in ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  // Auth operations
  async login(
    userId: number,
    username: string,
    password: string,
  ): Promise<ThingsboardLoginResponse> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/auth/login`;
      const response = await firstValueFrom(
        this.httpService.post<ThingsboardLoginResponse>(url, {
          username,
          password,
        }),
      );
      const { token: accessToken, refreshToken } = response.data;
      await this.loginWithTokens(userId, accessToken, refreshToken);

      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to login to ThingsBoard',
        error,
        this.logger,
      );
    }
  }

  async loginToSysadminAccount(
    username: string,
    password: string,
  ): Promise<ThingsboardLoginResponse> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/auth/login`;
      const response = await firstValueFrom(
        this.httpService.post<ThingsboardLoginResponse>(url, {
          username,
          password,
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to login to ThingsBoard',
        error,
        this.logger,
      );
    }
  }

  async loginWithTokens(
    userId: number,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    const thingsboardModel =
      await this.thingsboardRepository.findByUserId(userId);

    if (!thingsboardModel) {
      throw new Error(`ThingsBoard model not found for user ${userId}`);
    }

    thingsboardModel.setAccessToken(accessToken);
    thingsboardModel.setRefreshToken(refreshToken);
    await this.thingsboardRepository.update(thingsboardModel);
  }

  async getUser(accessToken: string): Promise<UserResponse> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/auth/user`;
      const response = await firstValueFrom(
        this.httpService.get<UserResponse>(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch user from ThingsBoard',
        error,
        this.logger,
      );
    }
  }

  async refreshToken(refreshToken: string): Promise<ThingsboardLoginResponse> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/auth/token`;
      const response = await firstValueFrom(
        this.httpService.post<ThingsboardLoginResponse>(url, {
          refreshToken,
        }),
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError && error.response
          ? error.response.data?.message || 'Unknown error'
          : error instanceof Error
            ? error.message
            : 'Unknown error';

      this.logger.error(`Failed to refresh token: ${errorMessage}`);
      ThingsboardApiException.createException(errorMessage, error, this.logger);
    }
  }

  // Tenant operations
  async getDefaultTenantProfile(
    sysAdminAccessToken: string,
  ): Promise<EntityId> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/tenantProfileInfo/default`;
      const response = await firstValueFrom(
        this.httpService.get<{ id: EntityId }>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data.id;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to get default tenant profile',
        error,
        this.logger,
      );
    }
  }

  async createTenant(
    tenantData: CreateTenantRequestDto,
    tenantProfileId: EntityId,
    sysAdminAccessToken: string,
  ): Promise<EntityId> {
    try {
      const apiBody = {
        ...tenantData,
        email: tenantData.tenantEmail,
        zip: tenantData.zipCode,
        tenantProfileId: tenantProfileId,
        additionalInfo: {
          description: tenantData.description,
        },
      };

      const url = `${this.THINGSBOARD_API_URL}/tenant`;
      const response = await firstValueFrom(
        this.httpService.post<{ id: EntityId }>(url, apiBody, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data.id;
    } catch (error) {
      this.logger.error('Failed to create tenant:', error);
      ThingsboardApiException.createException('Failed to create tenant', error);
    }
  }

  async deleteTenant(
    tenantId: string,
    sysAdminAccessToken: string,
  ): Promise<void> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/tenant/${tenantId}`;
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to delete tenant',
        error,
        this.logger,
      );
    }
  }

  // User operations
  async createTenantAdmin(
    userData: CreateTenantAdminRequestDto,
    tenantId: EntityId,
    customerId: string,
    sysAdminAccessToken: string,
  ): Promise<string> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/user?sendActivationMail=false`;

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
          id: customerId,
        },
      };

      const response = await firstValueFrom(
        this.httpService.post<{ id: EntityId }>(url, body, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data.id.id;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to create tenant admin',
        error,
        this.logger,
      );
    }
  }

  async getUserActivationLink(
    userId: string,
    sysAdminAccessToken: string,
  ): Promise<string> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/user/${userId}/activationLinkInfo`;
      const response = await firstValueFrom(
        this.httpService.get<{ value: string }>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data.value;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to get user activation link',
        error,
        this.logger,
      );
    }
  }

  async activateTenantAdmin(
    activationToken: string,
    password: string,
  ): Promise<ThingsboardLoginResponse & { tenantId: string }> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/noauth/activate?sendActivationMail=true`;
      const response = await firstValueFrom(
        this.httpService.post<ThingsboardLoginResponse>(url, {
          activateToken: activationToken,
          password,
        }),
      );

      const decodedToken = jwt.decode(response.data.token) as JwtPayload;

      return {
        ...response.data,
        tenantId: decodedToken.tenantId,
      };
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to activate tenant admin',
        error,
        this.logger,
      );
    }
  }

  // Rule Chain operations
  async createRuleChain(
    name: string,
    type: string,
    debugMode: boolean,
    accessToken: string,
  ): Promise<EntityId> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/ruleChain`;
      const response = await firstValueFrom(
        this.httpService.post<{ id: EntityId }>(
          url,
          { name, type, debugMode },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );
      return response.data.id;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to create rule chain',
        error,
        this.logger,
      );
    }
  }

  async updateRuleChainMetadata(
    ruleChainId: EntityId,
    metadata: any,
    accessToken: string,
  ): Promise<void> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/ruleChain/metadata`;
      await firstValueFrom(
        this.httpService.post(
          url,
          {
            ruleChainId,
            ...metadata,
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to update rule chain metadata',
        error,
        this.logger,
      );
    }
  }

  async getDefaultDeviceProfile(accessToken: string): Promise<EntityId> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/deviceProfileInfo/default`;
      const response = await firstValueFrom(
        this.httpService.get<{ id: EntityId }>(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data.id;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to get default device profile',
        error,
        this.logger,
      );
    }
  }

  async getDeviceProfile(
    deviceProfileId: string,
    accessToken: string,
  ): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/deviceProfile/${deviceProfileId}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to get device profile',
        error,
        this.logger,
      );
    }
  }

  async updateDeviceProfile(
    deviceProfile: any,
    accessToken: string,
  ): Promise<void> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/deviceProfile`;
      await firstValueFrom(
        this.httpService.post(url, deviceProfile, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to update device profile',
        error,
        this.logger,
      );
    }
  }
}
