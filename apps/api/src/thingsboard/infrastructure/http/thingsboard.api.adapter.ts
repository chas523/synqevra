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
import { MailSettingsDto } from '../../interface/rest/dtos/response/mail-settings.response.dto';
import {
  QueueDto,
  QueuesPageResponseDto,
} from '../../interface/rest/dtos/response/queue.response.dto';
import {
  ResourceDto,
  ResourceCreateDto,
  ResourcesPageResponseDto,
} from '../../interface/rest/dtos/response/resource.response.dto';
import { DeliveryMethodsResponse } from '../../interface/rest/dtos/response/delivery-methods.response.dto';
import { NotificationRequestResponse } from '../../interface/rest/dtos/response/notification-request.response.dto';
import { SendNotificationRequestDto } from '../../interface/rest/dtos/request/send-notification.request.dto';
import { CreateNotificationTargetRequestDto } from '../../interface/rest/dtos/request/create-notification-target.request.dto';
import {
  NotificationTargetDto,
  NotificationTargetsResponse,
} from '../../interface/rest/dtos/response/notification-target.response.dto';
import { CreateNotificationTemplateRequestDto } from '../../interface/rest/dtos/request/create-notification-template.request.dto';
import { CreateNotificationRuleRequestDto } from '../../interface/rest/dtos/request/create-notification-rule.request.dto';
import {
  NotificationTemplateDto,
  NotificationTemplatesResponse,
} from '../../interface/rest/dtos/response/notification-template.response.dto';
import {
  NotificationRulesResponse,
  NotificationRuleDto,
} from 'src/thingsboard/interface/rest/dtos/response/notification-rule.response.dto';
import { CreateWidgetTypeRequestDto, WidgetTypeDto, WidgetTypesPageDto } from 'src/thingsboard/interface/rest/dtos/response/widget-types.response.dto';
import { WidgetBundleDto, WidgetBundlesPageDto } from 'src/thingsboard/interface/rest/dtos/response/widget-bundles.response.dto';
import { ImagesPageResponseDto } from 'src/thingsboard/interface/rest/dtos/response/image.response.dto';
import { SaveWidgetBundleRequestDto } from 'src/thingsboard/interface/rest/dtos/request/save-widget-bundle.request.dto';
import { TwoFactorAuthSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-2fa-settings.response.dto';
import { TwoFactorAuthSettingsRequestDto } from 'src/thingsboard/interface/rest/dtos/request/thingsboard-2fa-settings.request.dto';

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
  ) { }

  private get THINGSBOARD_API_URL(): string {
    return (
      this.configService.getOrThrow<string>('THINGSBOARD_API_URL') + '/api'
    );
  }

  private get THINGSBOARD_SYSADMIN_EMAIL(): string {
    return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_EMAIL');
  }

  private get THINGSBOARD_SYSADMIN_PASSWORD(): string {
    return this.configService.getOrThrow<string>(
      'THINGSBOARD_SYSADMIN_PASSWORD',
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

  async loginToSysadminAccount(username: string, password: string): Promise<ThingsboardLoginResponse> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/auth/login`;
      const response = await firstValueFrom(
        this.httpService.post<ThingsboardLoginResponse>(url, {
          username: this.THINGSBOARD_SYSADMIN_EMAIL,
          password: this.THINGSBOARD_SYSADMIN_PASSWORD,
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to login to ThingsBoard as sysadmin',
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

  async fetchDeliveryMethods(
    sysAdminAccessToken: string,
  ): Promise<DeliveryMethodsResponse> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/notification/deliveryMethods`;
      const response = await firstValueFrom(
        this.httpService.get<string[]>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );

      // Transform the array of delivery method strings to the expected format
      const deliveryMethods = response.data.map((method) => ({
        method,
        name: this.formatDeliveryMethodName(method),
        enabled: true,
      }));

      return { deliveryMethods };
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch delivery methods',
        error,
        this.logger,
      );
    }
  }

  async fetchNotificationRequests(
    sysAdminAccessToken: string,
    params: {
      pageSize?: number;
      page?: number;
      sortProperty?: string;
      sortOrder?: string;
    },
  ): Promise<any> {
    try {
      const searchParams = new URLSearchParams();
      if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
      if (params.page !== undefined) searchParams.append('page', params.page.toString());
      if (params.sortProperty) searchParams.append('sortProperty', params.sortProperty);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const url = `${this.THINGSBOARD_API_URL}/notification/requests?${searchParams.toString()}`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );

      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch notification requests',
        error,
        this.logger,
      );
    }
  }

  async sendNotification(
    sysAdminAccessToken: string,
    notificationRequest: SendNotificationRequestDto,
  ): Promise<NotificationRequestResponse> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/notification/request`;
      const response = await firstValueFrom(
        this.httpService.post<NotificationRequestResponse>(url, notificationRequest, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to send notification',
        error,
        this.logger,
      );
    }
  }

  async fetchNotificationTargets(
    sysAdminAccessToken: string,
    params: {
      pageSize?: number;
      page?: number;
      sortProperty?: string;
      sortOrder?: string;
    },
  ): Promise<NotificationTargetsResponse> {
    try {
      const {
        pageSize = 10,
        page = 0,
        sortProperty = 'createdTime',
        sortOrder = 'DESC',
      } = params;

      const url = `${this.THINGSBOARD_API_URL}/notification/targets?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );

      const { data, totalElements, totalPages } = response.data;
      return {
        targets: data,
        totalElements,
        totalPages,
      };
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch notification targets',
        error,
        this.logger,
      );
    }
  }

  async fetchNotificationTemplates(
    sysAdminAccessToken: string,
    params: {
      pageSize?: number;
      page?: number;
      sortProperty?: string;
      sortOrder?: string;
      notificationTypes?: string;
    },
  ): Promise<NotificationTemplatesResponse> {
    try {
      const {
        pageSize = 10,
        page = 0,
        sortProperty = 'createdTime',
        sortOrder = 'DESC',
        notificationTypes,
      } = params;

      let url = `${this.THINGSBOARD_API_URL}/notification/templates?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`;
      if (notificationTypes) {
        url += `&notificationTypes=${notificationTypes}`;
      }

      this.logger.log(`Fetching templates with URL: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );

      const { data, totalElements, totalPages } = response.data;
      this.logger.log(`Fetched ${data?.length || 0} templates from ThingsBoard`);
      return {
        templates: data,
        totalElements,
        totalPages,
      };
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch notification templates',
        error,
        this.logger,
      );
    }
  }

  async fetchNotificationRules(
    sysAdminAccessToken: string,
    params: {
      pageSize?: number;
      page?: number;
      sortProperty?: string;
      sortOrder?: string;
    },
  ): Promise<NotificationRulesResponse> {
    try {
      const {
        pageSize = 10,
        page = 0,
        sortProperty = 'createdTime',
        sortOrder = 'DESC',
      } = params;

      const url = `${this.THINGSBOARD_API_URL}/notification/rules?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );

      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch notification rules',
        error,
        this.logger,
      );
    }
  }

  async saveNotificationRule(
    sysAdminAccessToken: string,
    rule: CreateNotificationRuleRequestDto,
  ): Promise<NotificationRuleDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/notification/rule`;
      const response = await firstValueFrom(
        this.httpService.post<NotificationRuleDto>(url, rule, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to save notification rule',
        error,
        this.logger,
      );
    }
  }

  private formatDeliveryMethodName(method: string): string {
    // Convert MOBILE_APP to Mobile App, WEB to Web, etc.
    return method
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
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
    resourceSubType?: string,
  ): Promise<ResourcesPageResponseDto> {
    try {
      let url = `${this.THINGSBOARD_API_URL}/resource?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`;
      if (resourceType) {
        url += `&resourceType=${resourceType}`;
      }
      if (resourceSubType) {
        url += `&resourceSubType=${resourceSubType}`;
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

  async fetchResourceInfo(
    sysAdminAccessToken: string,
    resourceId: string,
  ): Promise<ResourceDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/resource/info/${resourceId}`;
      const response = await firstValueFrom(
        this.httpService.get<ResourceDto>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch resource info',
        error,
        this.logger,
      );
    }
  }

  // Image methods
  async fetchImages(
    sysAdminAccessToken: string,
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = 'createdTime',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    imageSubType: string = 'IMAGE',
    includeSystemImages: boolean = false,
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortProperty,
        sortOrder,
        imageSubType,
        includeSystemImages: includeSystemImages.toString(),
      });
      const url = `${this.THINGSBOARD_API_URL}/images?${params.toString()}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch images',
        error,
        this.logger,
      );
    }
  }

  async uploadImage(
    sysAdminAccessToken: string,
    file: Buffer,
    fileName: string,
    title: string,
    imageSubType: string = 'IMAGE',
  ): Promise<any> {
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', file, { filename: fileName });
      formData.append('title', title);
      formData.append('imageSubType', imageSubType);

      const url = `${this.THINGSBOARD_API_URL}/image`;
      const response = await firstValueFrom(
        this.httpService.post(url, formData, {
          headers: {
            Authorization: `Bearer ${sysAdminAccessToken}`,
            ...formData.getHeaders(),
          },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to upload image',
        error,
        this.logger,
      );
    }
  }

  async deleteImage(
    sysAdminAccessToken: string,
    imageLink: string,
    force: boolean = false,
  ): Promise<any> {
    try {
      let url = '';
      if (imageLink.startsWith('/api')) {
        url = `${this.configService.getOrThrow<string>('THINGSBOARD_API_URL')}${imageLink}?force=${force}`;
      } else {
        url = `${this.THINGSBOARD_API_URL}${imageLink}?force=${force}`;
      }
      const response = await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to delete image',
        error,
        this.logger,
      );
    }
  }

  async downloadImage(
    sysAdminAccessToken: string,
    imageLink: string,
  ): Promise<Buffer> {
    try {
      let url = '';
      if (imageLink.startsWith('/api')) {
        url = `${this.configService.getOrThrow<string>('THINGSBOARD_API_URL')}${imageLink}`;
      } else {
        url = `${this.THINGSBOARD_API_URL}${imageLink}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
          responseType: 'arraybuffer',
        }),
      );
      return Buffer.from(response.data);
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to download image',
        error,
        this.logger,
      );
    }
  }

  async exportImage(
    sysAdminAccessToken: string,
    imageLink: string,
  ): Promise<any> {
    try {
      // Convert link like /api/images/tenant/xxx to /api/images/tenant/xxx/export
      let exportUrl = '';
      if (imageLink.startsWith('/api')) {
        exportUrl = `${this.configService.getOrThrow<string>('THINGSBOARD_API_URL')}${imageLink}/export`;
      } else {
        exportUrl = `${this.THINGSBOARD_API_URL}${imageLink}/export`;
      }

      const response = await firstValueFrom(
        this.httpService.get(exportUrl, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to export image',
        error,
        this.logger,
      );
    }
  }

  async fetchMailSettings(
    sysAdminAccessToken: string,
  ): Promise<MailSettingsDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/settings/mail`;
      const response = await firstValueFrom(
        this.httpService.get<MailSettingsDto>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch mail settings',
        error,
        this.logger,
      );
    }
  }

  async updateMailSettings(
    sysAdminAccessToken: string,
    settings: MailSettingsDto,
  ): Promise<MailSettingsDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/settings`;
      const response = await firstValueFrom(
        this.httpService.post<MailSettingsDto>(url, settings, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to update mail settings',
        error,
        this.logger,
      );
    }
  }

  // Widget Type operations
  async fetchWidgetTypes(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
    tenantOnly: boolean,
    fullSearch: boolean,
    scadaFirst: boolean,
    deprecatedFilter: string,
    widgetsBundleId: string = '',
  ): Promise<WidgetTypesPageDto> {
    try {
      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
        page: page.toString(),
        sortProperty,
        sortOrder,
        tenantOnly: tenantOnly.toString(),
        fullSearch: fullSearch.toString(),
        scadaFirst: scadaFirst.toString(),
        deprecatedFilter,
      });

      let url = `${this.THINGSBOARD_API_URL}/widgetTypes?${params.toString()}`;

      if (widgetsBundleId) {
        params.append('widgetsBundleId', widgetsBundleId);
        url = `${this.THINGSBOARD_API_URL}/widgetTypesInfos?${params.toString()}`;
      }
      const response = await firstValueFrom(
        this.httpService.get<WidgetTypesPageDto>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch widget types',
        error,
        this.logger,
      );
    }
  }

  async deleteWidgetType(
    sysAdminAccessToken: string,
    widgetTypeId: string,
  ): Promise<void> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/widgetType/${widgetTypeId}`;
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to delete widget type',
        error,
        this.logger,
      );
    }
  }

  async saveWidgetType(
    sysAdminAccessToken: string,
    widgetType: any,
    updateExistingByFqn: boolean = false,
  ): Promise<WidgetTypeDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/widgetType?updateExistingByFqn=${updateExistingByFqn}`;
      const response = await firstValueFrom(
        this.httpService.post<WidgetTypeDto>(url, widgetType, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to save widget type',
        error,
        this.logger,
      );
    }
  }

  async fetchWidgetTypeById(
    sysAdminAccessToken: string,
    widgetTypeId: string,
  ): Promise<WidgetTypeDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/widgetType/${widgetTypeId}`;
      const response = await firstValueFrom(
        this.httpService.get<WidgetTypeDto>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch widget type by id',
        error,
        this.logger,
      );
    }
  }

  async downloadWidgetType(
    sysAdminAccessToken: string,
    widgetTypeId: string,
    includeResources: boolean = false,
  ): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/widgetType/${widgetTypeId}?includeResources=${includeResources}`;
      const response = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to download widget type',
        error,
        this.logger,
      );
    }
  }

  async createNotificationTarget(
    sysAdminAccessToken: string,
    request: CreateNotificationTargetRequestDto,
  ): Promise<NotificationTargetDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/notification/target`;
      const response = await firstValueFrom(
        this.httpService.post<NotificationTargetDto>(url, request, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );

      this.logger.log(
        `Created notification target: ${response.data.name} (ID: ${response.data.id.id})`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to create notification target: ${error.response?.data?.message || error.message}`,
      );
      throw new ThingsboardApiException(
        error.response?.data?.message || 'Failed to create notification target',
        error.response?.status || 500,
      );
    }
  }


  async previewNotificationRequest(
    sysAdminAccessToken: string,
    previewRequest: any,
  ): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/notification/request/preview`;
      const response = await firstValueFrom(
        this.httpService.post<any>(url, previewRequest, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      this.logger.log('Notification preview generated successfully');
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to preview notification request: ${error.response?.data?.message || error.message}`,
      );
      throw new ThingsboardApiException(
        error.response?.data?.message ||
        'Failed to preview notification request',
        error.response?.status || 500,
      );
    }
  }

  async createNotificationTemplate(
    sysAdminAccessToken: string,
    templateData: CreateNotificationTemplateRequestDto,
  ): Promise<NotificationTemplateDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/notification/template`;
      const response = await firstValueFrom(
        this.httpService.post<NotificationTemplateDto>(url, templateData, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to create notification template',
        error,
        this.logger,
      );
    }
  }

  async fetchMaterialIcons(
    sysAdminAccessToken: string,
  ): Promise<string[]> {
    try {
      // Material icons JSON is a public static asset, doesn't require authentication
      const url = `${this.THINGSBOARD_API_URL}/assets/metadata/material-icons.json`;
      const response = await firstValueFrom(
        this.httpService.get<string[]>(url),
      );
      this.logger.log(`Fetched ${response.data?.length || 0} material icons`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch material icons: ${error.response?.data?.message || error.message}`,
      );
      throw new ThingsboardApiException(
        error.response?.data?.message ||
        'Failed to fetch material icons',
        error.response?.status || 500,
      );
    }
  }

  async fetchWidgetBundles(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
    tenantOnly: boolean,
    fullSearch: boolean,
    scadaFirst: boolean,
  ): Promise<WidgetBundlesPageDto> {
    try {
      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
        page: page.toString(),
        sortProperty,
        sortOrder,
        tenantOnly: tenantOnly.toString(),
        fullSearch: fullSearch.toString(),
        scadaFirst: scadaFirst.toString(),
      });

      const url = `${this.THINGSBOARD_API_URL}/widgetsBundles?${params.toString()}`;
      const response = await firstValueFrom(
        this.httpService.get<WidgetBundlesPageDto>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch widget bundles',
        error,
        this.logger,
      );
    }
  }

  async fetchWidgetBundleById(
    sysAdminAccessToken: string,
    widgetsBundleId: string,
  ): Promise<WidgetBundleDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/widgetsBundle/${widgetsBundleId}`;
      const response = await firstValueFrom(
        this.httpService.get<WidgetBundleDto>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch widget bundle by id',
        error,
        this.logger,
      );
    }
  }

  async saveWidgetBundle(
    sysAdminAccessToken: string,
    widgetBundle: SaveWidgetBundleRequestDto,
  ): Promise<WidgetBundleDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/widgetsBundle`;
      const response = await firstValueFrom(
        this.httpService.post<WidgetBundleDto>(url, widgetBundle, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to save widget bundle',
        error,
        this.logger,
      );
    }
  }
  async fetchTwoFaSettings(
    sysAdminAccessToken: string,
  ): Promise<TwoFactorAuthSettingsDto> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/2fa/settings`;
      const response = await firstValueFrom(
        this.httpService.get<TwoFactorAuthSettingsDto>(url, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch 2FA settings',
        error,
        this.logger,
      );
    }
  }

  async saveTwoFaSettings(
    sysAdminAccessToken: string,
    settings: TwoFactorAuthSettingsRequestDto,
  ): Promise<void> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/2fa/settings`;
      await firstValueFrom(
        this.httpService.post(url, settings, {
          headers: { Authorization: `Bearer ${sysAdminAccessToken}` },
        }),
      );
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to save 2FA settings',
        error,
        this.logger,
      );
    }
  }

  async getWidgetsBundles(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
    tenantOnly: boolean,
    fullSearch: boolean,
    scadaFirst: boolean,
    deprecatedFilter: string,
  ): Promise<any> {
    try {
      // Constructing URL with query parameters.
      // Note: Handling boolean/string conversion might be needed if values are not strings.
      // Assuming query params are handled correctly by the caller or stringified here.
      const queryParams = new URLSearchParams({
        pageSize: pageSize.toString(),
        page: page.toString(),
        sortProperty: sortProperty,
        sortOrder: sortOrder,
        tenantOnly: String(tenantOnly),
        fullSearch: String(fullSearch),
        scadaFirst: String(scadaFirst),
        deprecatedFilter: deprecatedFilter,
      });

      const url = `${this.THINGSBOARD_API_URL}/widgetsBundles?${queryParams.toString()}`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch widget bundles from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async getWidgetTypeFqns(
    accessToken: string,
    widgetsBundleId: string,
  ): Promise<any> {
    try {
      // User provided endpoint: GET /api/widgetTypeFqns?widgetsBundleId={uuid}
      const url = `${this.THINGSBOARD_API_URL}/widgetTypeFqns?widgetsBundleId=${widgetsBundleId}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch widget type FQNs from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async saveWidgetTypeFqns(
    accessToken: string,
    widgetsBundleId: string,
    fqns: string[],
  ): Promise<any> {
    try {
      // User provided endpoint: POST /widgetsBundle/{uuid}/widgetTypeFqns
      const url = `${this.THINGSBOARD_API_URL}/widgetsBundle/${widgetsBundleId}/widgetTypeFqns`;
      const response = await firstValueFrom(
        this.httpService.post(url, fqns, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to save widget type FQNs to ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  // OTA Package operations
  async fetchOtaPackages(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
  ): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/otaPackages?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch OTA packages from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async createOtaPackage(
    accessToken: string,
    payload: any,
  ): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/otaPackage`;
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to create OTA package in ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async deleteOtaPackage(
    accessToken: string,
    id: string,
  ): Promise<void> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/otaPackage/${id}`;
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to delete OTA package from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async downloadOtaPackage(
    accessToken: string,
    id: string,
  ): Promise<Buffer> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/otaPackage/${id}/download`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
          responseType: 'arraybuffer',
        }),
      );
      return Buffer.from(response.data);
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to download OTA package from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async fetchDeviceProfileInfos(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
  ): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/deviceProfileInfos?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch device profile infos from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  // Version Control operations
  async getRepoSettingsInfo(accessToken: string): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/repositorySettings/info`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to get repository settings info',
        error,
        this.logger,
      );
    }
  }

  async checkRepoAccess(accessToken: string, payload: any): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/repositorySettings/checkAccess`;
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to check repository access',
        error,
        this.logger,
      );
    }
  }

  async getRepoSettings(accessToken: string): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/repositorySettings`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch repository settings from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async saveRepoSettings(accessToken: string, payload: any): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/repositorySettings`;
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to save repository settings',
        error,
        this.logger,
      );
    }
  }

  async fetchVersions(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: string,
    branch: string,
  ): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/entities/vc/version?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}&branch=${branch}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch versions from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async fetchEntityVersions(
    accessToken: string,
    entityType: string,
    id: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: string,
    branch: string,
  ): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/entities/vc/version/${entityType}/${id}?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}&branch=${branch}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch entity versions from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async deleteRepoSettings(accessToken: string): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/admin/repositorySettings`;
      const response = await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to delete repository settings from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async getBranches(accessToken: string): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/entities/vc/branches`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch branches from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async getTrendzSettings(accessToken: string): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/trendz/settings`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch Trendz settings from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async saveTrendzSettings(accessToken: string, payload: any): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/trendz/settings`;
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to save Trendz settings to ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async getAiModels(accessToken: string, page: number, pageSize: number, sortProperty: string, sortOrder: string): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/ai/model?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to fetch AI models from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async saveAiModel(accessToken: string, payload: any): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/ai/model`;
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to save AI model to ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async deleteAiModel(accessToken: string, modelId: string): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/ai/model/${modelId}`;
      const response = await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to delete AI model from ThingsBoard API',
        error,
        this.logger,
      );
    }
  }

  async checkAiModelConnectivity(accessToken: string, payload: any): Promise<any> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/ai/model/chat`;
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      ThingsboardApiException.createException(
        'Failed to check AI model connectivity',
        error,
        this.logger,
      );
    }
  }
}

