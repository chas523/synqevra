import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  EntityId,
  RelationInfo,
  TenantProfilesResponse,
  ThingsboardApiPort,
  ThingsboardLoginResponse,
  UserResponse,
  TenantProfile,
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
import {
  THINGSBOARD_REPOSITORY_PORT,
  ThingsboardRepositoryPort,
} from '../../application/ports/thingsboard.repository.port';
import { SecuritySettingsDto as SecuritySettingsDtoResponse } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-security-settings.response.dto';
import { ExtendedSecuritySettingsDto } from 'src/thingsboard/interface/rest/dtos/request/thingsboard-security-settings.request.dto';
import { GetTenantsResponse } from '../../interface/rest/dtos/response/thingsboard-get-tenants.response.dto';
import { GetTenantUsersResponse } from '../../interface/rest/dtos/response/thingsboard-get-tenant-users.response.dto';
import { GetTenantDevicesResponse } from '../../interface/rest/dtos/response/thingsboard-get-tenant-devices.response.dto';
import { GetNotificationsResponse } from '../../interface/rest/dtos/response/thingsboard-get-notifications.response.dto';
import { DashboardVersionResponse } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-version.response.dto';
import { GeneralSettingsDto } from '../../interface/rest/dtos/response/general-settings.response.dto';
import { ConnectivitySettingsDto } from '../../interface/rest/dtos/response/connectivity-settings.response.dto';
import { SmsSettingsDto } from '../../interface/rest/dtos/response/sms-settings.response.dto';
import { NotificationSettingsDto } from '../../interface/rest/dtos/response/notification-settings.response.dto';
import {
  QueueDto,
  QueuesPageResponseDto,
} from '../../interface/rest/dtos/response/queue.response.dto';
import {
  ResourceDto,
  ResourceCreateDto,
  ResourcesPageResponseDto,
} from '../../interface/rest/dtos/response/resource.response.dto';

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
      if (payload.parameters && payload.parameters.length > 0) {
        await this.updateDeviceSharedAttributes(
          accessToken,
          response.data.id.id,
          { telemetry_keys: payload.parameters },
        );
      }
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
      ThingsboardApiException.createException(
        'Failed to refresh token',
        error,
        this.logger,
      );
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

  async updateTenant(
    tenantData: any,
    sysAdminAccessToken: string,
  ): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/tenant`;
      const response = await firstValueFrom(
        this.httpService.post(url, tenantData, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to update tenant:', error);
      ThingsboardApiException.createException('Failed to update tenant', error);
    }
  }

  async deleteTenantAdmin(
    tenantAdminId: string,
    sysAdminAccessToken: string,
  ): Promise<void> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/user/${tenantAdminId}`;
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to delete tenant admin',
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

  async fetchSecuritySettings(sysAdminAccessToken: string) {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/securitySettings`;

      const response = await firstValueFrom(
        this.httpService.get<SecuritySettingsDtoResponse>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch security settings',
        error,
        this.logger,
      );
    }
  }

  async updateSecuritySettings(
    sysAdminAccessToken: string,
    settings: ExtendedSecuritySettingsDto,
  ) {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/securitySettings`;

      const response = await firstValueFrom(
        this.httpService.post<SecuritySettingsDtoResponse>(url, settings, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to update security settings',
        error,
        this.logger,
      );
    }
  }

  private stripHtmlTags(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .trim();
  }

  async fetchNotifications(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
  ): Promise<GetNotificationsResponse> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/notifications?pageSize=${pageSize}&page=${page}&sortProperty=createdTime&sortOrder=DESC`;
      const response = await firstValueFrom(
        this.httpService.get<GetNotificationsResponse>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );

      // Strip HTML tags from notification text and subject
      const cleanedData = {
        ...response.data,
        data: response.data.data.map((notification) => ({
          ...notification,
          text: notification.text
            ? this.stripHtmlTags(notification.text)
            : notification.text,
          subject: notification.subject
            ? this.stripHtmlTags(notification.subject)
            : notification.subject,
        })),
      };

      return cleanedData;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch notifications',
        error,
        this.logger,
      );
    }
  }

  async fetchTenants(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
  ): Promise<GetTenantsResponse> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/tenants?pageSize=${pageSize}&page=${page}`;

      const response = await firstValueFrom(
        this.httpService.get<GetTenantsResponse>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch tenants',
        error,
        this.logger,
      );
    }
  }

  async fetchTenantUsers(
    sysadminAccessToken: string,
    id: string,
    page: number,
    pageSize: number,
  ): Promise<GetTenantUsersResponse> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/tenant/${id}/users?pageSize=${pageSize}&page=${page}&sortProperty=createdTime&sortOrder=DESC`;
      const response = await firstValueFrom(
        this.httpService.get<GetTenantUsersResponse>(url, {
          headers: { Authorization: `Bearer ${sysadminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch tenant users',
        error,
        this.logger,
      );
    }
  }

  async fetchTenantDevices(
    sysadminAccessToken: string,
    tenantId: string,
    page: number,
    pageSize: number,
  ): Promise<GetTenantDevicesResponse> {
    try {
      const tenantAdminUserId = await this.getTenantAdminUserId(
        sysadminAccessToken,
        tenantId,
      );

      if (!tenantAdminUserId) {
        throw new Error(`No Tenant Admin found for tenant ${tenantId}`);
      }

      const tenantAdminToken = await this.getTenantToken(
        sysadminAccessToken,
        tenantAdminUserId,
      );

      return this.fetchTenantDevicesAsTenantAdmin(
        tenantAdminToken,
        tenantId,
        page,
        pageSize,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching tenant devices: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        'ThingsboardApiAdapter',
      );
      ThingsboardApiException.createException(
        'Failed to fetch tenant devices',
        error,
        this.logger,
      );
    }
  }

  private async getTenantToken(
    sysadminAccessToken: string,
    userId: string,
  ): Promise<string> {
    const url = `${this.THINGSBOARD_API_URL}/user/${userId}/token`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${sysadminAccessToken}` },
        }),
      );

      return response.data.token;
    } catch (error) {
      this.logger.error(`Failed to get token for user ${userId}: ${error}`);
      throw error;
    }
  }

  private async getTenantAdminUserId(
    sysadminAccessToken: string,
    tenantId: string,
  ): Promise<string | null> {
    const url = `${this.THINGSBOARD_API_URL}/tenant/${tenantId}/users?pageSize=10&page=0`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${sysadminAccessToken}` },
        }),
      );

      // first 'TENANT_ADMIN'
      const adminUser = response.data.data.find(
        (u: any) => u.authority === 'TENANT_ADMIN',
      );
      return adminUser ? adminUser.id.id : null;
    } catch (error) {
      this.logger.error(`Failed to find tenant admin user: ${error}`);
      throw error;
    }
  }

  private async fetchTenantDevicesAsTenantAdmin(
    tenantAdminAccessToken: string,
    tenantId: string,
    page: number,
    pageSize: number,
  ): Promise<GetTenantDevicesResponse> {
    const url = `${this.THINGSBOARD_API_URL}/tenant/devices`;

    try {
      this.logger.log(
        `Fetching devices as tenant admin for tenantId: ${tenantId}`,
        'ThingsboardApiAdapter',
      );

      const response = await firstValueFrom(
        this.httpService.get<GetTenantDevicesResponse>(url, {
          headers: { Authorization: `Bearer ${tenantAdminAccessToken}` },
          params: {
            pageSize,
            page,
            sortProperty: 'createdTime',
            sortOrder: 'DESC',
          },
        }),
      );

      this.logger.log(
        `Successfully fetched ${response.data.data.length} devices for tenant ${tenantId}`,
        'ThingsboardApiAdapter',
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching devices: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        'ThingsboardApiAdapter',
      );
      throw error;
    }
  }

  async fetchDashboardVersion(
    sysadminAccessToken: string,
  ): Promise<DashboardVersionResponse> {
    const url = `${this.THINGSBOARD_API_URL}/admin/updates`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<DashboardVersionResponse>(url, {
          headers: { Authorization: `Bearer ${sysadminAccessToken}` },
        }),
      );

      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch tenants',
        error,
        this.logger,
      );
    }
  }

  // Tenant detail operations
  async fetchTenantAttributes(
    sysAdminAccessToken: string,
    tenantId: string,
    scope: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE',
  ): Promise<any[]> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/plugins/telemetry/TENANT/${tenantId}/values/attributes/${scope}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch tenant attributes (may not be available): ${error}`,
      );
      return [];
    }
  }

  async fetchEntityAttributes(
    sysAdminAccessToken: string,
    entityType: string,
    entityId: string,
    scope: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE',
  ): Promise<any[]> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/plugins/telemetry/${entityType}/${entityId}/values/attributes/${scope}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch entity attributes (may not be available): ${error}`,
      );
      return [];
    }
  }

  async fetchEntityAlarms(
    sysAdminAccessToken: string,
    entityType: string,
    entityId: string,
    page: number,
    pageSize: number,
    statusList?: string[],
    severityList?: string[],
    startTime?: number,
    endTime?: number,
  ): Promise<any> {
    try {
      let url = `${this.THINGSBOARD_API_URL}/v2/alarm/${entityType}/${entityId}?pageSize=${pageSize}&page=${page}&sortProperty=createdTime&sortOrder=DESC`;
      if (statusList && statusList.length > 0) {
        url += `&statusList=${statusList.join(',')}`;
      }
      if (severityList && severityList.length > 0) {
        url += `&severityList=${severityList.join(',')}`;
      }
      if (startTime !== undefined) {
        url += `&startTime=${startTime}`;
      }
      if (endTime !== undefined) {
        url += `&endTime=${endTime}`;
      }
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch entity alarms (may not be available): ${error}`,
      );
      return { data: [], totalPages: 0, totalElements: 0, hasNext: false };
    }
  }

  async fetchEntityEvents(
    sysAdminAccessToken: string,
    entityType: string,
    entityId: string,
    page: number,
    pageSize: number,
    eventType?: string,
    startTime?: number,
    endTime?: number,
  ): Promise<any> {
    try {
      // ThingsBoard events API requires startTime and endTime
      const end = endTime || Date.now();
      const start = startTime || end - 30 * 24 * 60 * 60 * 1000; // Last 30 days or provided
      const type = eventType || 'LC_EVENT'; // Default to lifecycle events

      const url = `${this.THINGSBOARD_API_URL}/events/${entityType}/${entityId}/${type}?tenantId=${entityId}&startTime=${start}&endTime=${end}&pageSize=${pageSize}&page=${page}&sortProperty=createdTime&sortOrder=DESC`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch entity events (may not be available): ${error}`,
      );
      // Return empty response instead of throwing - events may not exist for all entities
      return { data: [], totalPages: 0, totalElements: 0, hasNext: false };
    }
  }

  async fetchEntityRelations(
    sysAdminAccessToken: string,
    entityType: string,
    entityId: string,
    direction: 'FROM' | 'TO',
  ): Promise<any[]> {
    try {
      const param = direction === 'FROM' ? 'fromId' : 'toId';
      const typeParam = direction === 'FROM' ? 'fromType' : 'toType';
      const url = `${this.THINGSBOARD_API_URL}/relations/info?${param}=${entityId}&${typeParam}=${entityType}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch entity relations (may not be available): ${error}`,
      );
      return [];
    }
  }

  async saveEntityAttributes(
    sysAdminAccessToken: string,
    entityType: string,
    entityId: string,
    scope: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE',
    attributes: Record<string, unknown>,
  ): Promise<void> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/plugins/telemetry/${entityType}/${entityId}/${scope}`;
      await firstValueFrom(
        this.httpService.post(url, attributes, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to save entity attributes: ${error}`);
      ThingsboardApiException.createException(
        'Failed to save entity attributes',
        error,
      );
    }
  }

  async saveRelation(
    sysAdminAccessToken: string,
    relation: RelationInfo,
  ): Promise<void> {
    const url = `${this.THINGSBOARD_API_URL}/relation`;
    await firstValueFrom(
      this.httpService.post(url, relation, {
        headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
      }),
    );
  }

  async deleteRelation(
    sysAdminAccessToken: string,
    fromId: string,
    fromType: string,
    relationType: string,
    toId: string,
    toType: string,
  ): Promise<void> {
    const url = `${this.THINGSBOARD_API_URL}/relation`;
    const params = new URLSearchParams({
      fromId,
      fromType,
      relationType,
      toId,
      toType,
    });

    await firstValueFrom(
      this.httpService.delete(`${url}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
      }),
    );
  }

  async fetchTenantProfiles(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: string,
    textSearch?: string,
  ): Promise<TenantProfilesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (sortProperty) {
      params.append('sortProperty', sortProperty);
    }

    if (sortOrder) {
      params.append('sortOrder', sortOrder);
    }

    if (textSearch) {
      params.append('textSearch', textSearch);
    }

    const url = `${this.THINGSBOARD_API_URL}/tenantProfiles?${params.toString()}`;

    const response = await firstValueFrom(
      this.httpService.get<TenantProfilesResponse>(url, {
        headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
      }),
    );

    return response.data;
  }

  async saveTenantProfile(
    accessToken: string,
    tenantProfile: TenantProfile,
  ): Promise<TenantProfile> {
    const url = `${this.THINGSBOARD_API_URL}/tenantProfile`;

    const response = await firstValueFrom(
      this.httpService.post<TenantProfile>(url, tenantProfile, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );

    return response.data;
  }

  async fetchGeneralSettings(
    sysAdminAccessToken: string,
  ): Promise<GeneralSettingsDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/settings/general`;
      const response = await firstValueFrom(
        this.httpService.get<GeneralSettingsDto>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch general settings',
        error,
        this.logger,
      );
    }
  }

  async updateGeneralSettings(
    sysAdminAccessToken: string,
    settings: GeneralSettingsDto,
  ): Promise<GeneralSettingsDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/settings`;
      const response = await firstValueFrom(
        this.httpService.post<GeneralSettingsDto>(url, settings, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to update general settings',
        error,
        this.logger,
      );
    }
  }

  async fetchConnectivitySettings(
    sysAdminAccessToken: string,
  ): Promise<ConnectivitySettingsDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/settings/connectivity`;
      const response = await firstValueFrom(
        this.httpService.get<ConnectivitySettingsDto>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch connectivity settings',
        error,
        this.logger,
      );
    }
  }

  async updateConnectivitySettings(
    sysAdminAccessToken: string,
    settings: ConnectivitySettingsDto,
  ): Promise<ConnectivitySettingsDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/settings`;
      const response = await firstValueFrom(
        this.httpService.post<ConnectivitySettingsDto>(url, settings, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to update connectivity settings',
        error,
        this.logger,
      );
    }
  }

  async fetchSmsSettings(sysAdminAccessToken: string): Promise<SmsSettingsDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/settings/sms`;
      const response = await firstValueFrom(
        this.httpService.get<SmsSettingsDto>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch SMS settings',
        error,
        this.logger,
      );
    }
  }

  async updateSmsSettings(
    sysAdminAccessToken: string,
    settings: SmsSettingsDto,
  ): Promise<SmsSettingsDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/settings`;
      const response = await firstValueFrom(
        this.httpService.post<SmsSettingsDto>(url, settings, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to update SMS settings',
        error,
        this.logger,
      );
    }
  }

  async fetchNotificationSettings(
    sysAdminAccessToken: string,
  ): Promise<NotificationSettingsDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/notification/settings`;
      const response = await firstValueFrom(
        this.httpService.get<NotificationSettingsDto>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch notification settings',
        error,
        this.logger,
      );
    }
  }

  async updateNotificationSettings(
    sysAdminAccessToken: string,
    settings: NotificationSettingsDto,
  ): Promise<NotificationSettingsDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/notification/settings`;
      const response = await firstValueFrom(
        this.httpService.post<NotificationSettingsDto>(url, settings, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to update notification settings',
        error,
        this.logger,
      );
    }
  }

  // Queue operations
  async fetchQueues(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
  ): Promise<QueuesPageResponseDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/queues?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}&serviceType=TB_RULE_ENGINE`;
      const response = await firstValueFrom(
        this.httpService.get<QueuesPageResponseDto>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch queues',
        error,
        this.logger,
      );
    }
  }

  async createQueue(
    sysAdminAccessToken: string,
    queue: QueueDto,
  ): Promise<QueueDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/queues?serviceType=TB_RULE_ENGINE`;
      const response = await firstValueFrom(
        this.httpService.post<QueueDto>(url, queue, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to create/update queue',
        error,
        this.logger,
      );
    }
  }

  async deleteQueue(
    sysAdminAccessToken: string,
    queueId: string,
  ): Promise<void> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/queues/${queueId}?serviceType=TB_RULE_ENGINE`;
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to delete queue',
        error,
        this.logger,
      );
    }
  }

  // Resource operations
  async fetchResources(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
    resourceType?: string,
  ): Promise<ResourcesPageResponseDto> {
    try {
      let url = `${this.THINGSBOARD_API_URL}/resource?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`;
      if (resourceType) {
        url += `&resourceType=${resourceType}`;
      }
      const response = await firstValueFrom(
        this.httpService.get<ResourcesPageResponseDto>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch resources',
        error,
        this.logger,
      );
    }
  }

  async createResource(
    sysAdminAccessToken: string,
    resource: ResourceCreateDto,
  ): Promise<ResourceDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/resource`;
      const response = await firstValueFrom(
        this.httpService.post<ResourceDto>(url, resource, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to create resource',
        error,
        this.logger,
      );
    }
  }

  async deleteResource(
    sysAdminAccessToken: string,
    resourceId: string,
    force: boolean = false,
  ): Promise<void> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/resource/${resourceId}?force=${force}`;
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to delete resource',
        error,
        this.logger,
      );
    }
  }

  async downloadResource(
    sysAdminAccessToken: string,
    resourceId: string,
  ): Promise<Buffer> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/resource/${resourceId}/download`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
          responseType: 'arraybuffer',
        }),
      );
      return Buffer.from(response.data);
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to download resource',
        error,
        this.logger,
      );
    }
  }
}
