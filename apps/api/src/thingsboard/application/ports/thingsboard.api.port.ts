import { CreateDeviceRequest } from 'src/thingsboard/interface/rest/dtos/request/thingsboard-device.request.dto';
import { Device } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-created-device.response.dto';
import { DeviceAttributes } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-device-attributes.response.dto';
import { DeviceDetails } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-device.response.dto';
import { DevicesResponse } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-devices.response.dto';
import { CreateTenantRequestDto } from 'src/thingsboard/interface/rest/dtos/request/create-tenant.request.dto';
import { CreateTenantAdminRequestDto } from 'src/thingsboard/interface/rest/dtos/request/create-tenant-admin.request.dto';
import {
  EntityId,
  ThingsboardLoginResponse,
  UserResponse,
} from 'src/thingsboard/infrastructure/http/thingsboard.api.types';
import { GetTenantsResponse } from '../../interface/rest/dtos/response/thingsboard-get-tenants.response.dto';
import { GetTenantUsersResponse } from '../../interface/rest/dtos/response/thingsboard-get-tenant-users.response.dto';
import { GetTenantDevicesResponse } from '../../interface/rest/dtos/response/thingsboard-get-tenant-devices.response.dto';
import { GetNotificationsResponse } from '../../interface/rest/dtos/response/thingsboard-get-notifications.response.dto';
import { SecuritySettingsDto as SecuritySettingsDtoResponse } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-security-settings.response.dto';
import { ExtendedSecuritySettingsDto } from 'src/thingsboard/interface/rest/dtos/request/thingsboard-security-settings.request.dto';
import { DashboardVersionResponse } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-version.response.dto';
import { GeneralSettingsDto } from '../../interface/rest/dtos/response/general-settings.response.dto';
import { ConnectivitySettingsDto } from '../../interface/rest/dtos/response/connectivity-settings.response.dto';
import { SmsSettingsDto } from '../../interface/rest/dtos/response/sms-settings.response.dto';
import { NotificationSettingsDto } from '../../interface/rest/dtos/response/notification-settings.response.dto';
import { QueueDto, QueuesPageResponseDto } from '../../interface/rest/dtos/response/queue.response.dto';
import { ResourceDto, ResourceCreateDto, ResourcesPageResponseDto } from '../../interface/rest/dtos/response/resource.response.dto';

// Re-export infrastructure types for handlers
export type { EntityId, ThingsboardLoginResponse, UserResponse };

export const THINGSBOARD_API_PORT = Symbol('THINGSBOARD_API_PORT');

export abstract class ThingsboardApiPort {
  // Auth operations
  abstract login(
    userId: number,
    username: string,
    password: string,
  ): Promise<ThingsboardLoginResponse>;
  abstract loginToSysadminAccount(
    username: string,
    password: string,
  ): Promise<ThingsboardLoginResponse>;
  abstract getUser(accessToken: string): Promise<UserResponse>;
  abstract refreshToken(
    refreshToken: string,
  ): Promise<ThingsboardLoginResponse>;

  // Tenant operations
  abstract getDefaultTenantProfile(
    sysAdminAccessToken: string,
  ): Promise<EntityId>;
  abstract createTenant(
    tenantData: CreateTenantRequestDto,
    tenantProfileId: EntityId,
    sysAdminAccessToken: string,
  ): Promise<EntityId>;
  abstract deleteTenant(
    tenantId: string,
    sysAdminAccessToken: string,
  ): Promise<void>;
  abstract deleteTenantAdmin(
    tenantAdminId: string,
    sysAdminAccessToken: string,
  ): Promise<void>;

  // User operations
  abstract createTenantAdmin(
    userData: CreateTenantAdminRequestDto,
    tenantId: EntityId,
    customerId: string,
    sysAdminAccessToken: string,
  ): Promise<string>;
  abstract getUserActivationLink(
    userId: string,
    sysAdminAccessToken: string,
  ): Promise<string>;
  abstract activateTenantAdmin(
    activationToken: string,
    password: string,
  ): Promise<ThingsboardLoginResponse & { tenantId: string }>;

  // Rule Chain operations
  abstract createRuleChain(
    name: string,
    type: string,
    debugMode: boolean,
    accessToken: string,
  ): Promise<EntityId>;
  abstract updateRuleChainMetadata(
    ruleChainId: EntityId,
    metadata: any,
    accessToken: string,
  ): Promise<void>;
  abstract getDefaultDeviceProfile(accessToken: string): Promise<EntityId>;
  abstract getDeviceProfile(
    deviceProfileId: string,
    accessToken: string,
  ): Promise<any>;
  abstract updateDeviceProfile(
    deviceProfile: any,
    accessToken: string,
  ): Promise<void>;

  // Device operations
  abstract fetchDevices(
    accessToken: string,
    page: number,
    pageSize: number,
  ): Promise<DevicesResponse>;
  abstract fetchDevice(accessToken: string, id: string): Promise<DeviceDetails>;
  abstract createDevice(
    accessToken: string,
    payload: CreateDeviceRequest,
    userId: number,
  ): Promise<Device>;
  abstract deleteDevice(accessToken: string, id: string): Promise<void>;
  abstract fetchDeviceSharedAttributes(
    accessToken: string,
    id: string,
  ): Promise<DeviceAttributes>;
  abstract updateDeviceSharedAttributes(
    accessToken: string,
    id: string,
    attributes: Record<string, any>,
  ): Promise<void>;

  // Admin operations
  abstract fetchTenants(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
  ): Promise<GetTenantsResponse>;
  abstract fetchTenantUsers(
    sysadminAccessToken: string,
    id: string,
    page: number,
    pageSize: number,
  ): Promise<GetTenantUsersResponse>;
  abstract fetchTenantDevices(
    sysadminAccessToken: string,
    tenantId: string,
    page: number,
    pageSize: number,
  ): Promise<GetTenantDevicesResponse>;
  abstract fetchNotifications(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
  ): Promise<GetNotificationsResponse>;
  abstract fetchDashboardVersion(
    sysadminAccessToken: string,
  ): Promise<DashboardVersionResponse>;

  //Settings operations
  abstract fetchSecuritySettings(
    sysAdminAccessToken: string,
  ): Promise<SecuritySettingsDtoResponse>;

  abstract updateSecuritySettings(
    sysAdminAccessToken: string,
    settings: ExtendedSecuritySettingsDto,
  ): Promise<SecuritySettingsDtoResponse>;

  // General Settings operations
  abstract fetchGeneralSettings(
    sysAdminAccessToken: string,
  ): Promise<GeneralSettingsDto>;

  abstract updateGeneralSettings(
    sysAdminAccessToken: string,
    settings: GeneralSettingsDto,
  ): Promise<GeneralSettingsDto>;

  // Connectivity Settings operations
  abstract fetchConnectivitySettings(
    sysAdminAccessToken: string,
  ): Promise<ConnectivitySettingsDto>;

  abstract updateConnectivitySettings(
    sysAdminAccessToken: string,
    settings: ConnectivitySettingsDto,
  ): Promise<ConnectivitySettingsDto>;

  // SMS Settings operations
  abstract fetchSmsSettings(
    sysAdminAccessToken: string,
  ): Promise<SmsSettingsDto>;

  abstract updateSmsSettings(
    sysAdminAccessToken: string,
    settings: SmsSettingsDto,
  ): Promise<SmsSettingsDto>;

  // Notification Settings operations
  abstract fetchNotificationSettings(
    sysAdminAccessToken: string,
  ): Promise<NotificationSettingsDto>;

  abstract updateNotificationSettings(
    sysAdminAccessToken: string,
    settings: NotificationSettingsDto,
  ): Promise<NotificationSettingsDto>;

  // Queue operations
  abstract fetchQueues(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
  ): Promise<QueuesPageResponseDto>;

  abstract createQueue(
    sysAdminAccessToken: string,
    queue: QueueDto,
  ): Promise<QueueDto>;

  abstract deleteQueue(
    sysAdminAccessToken: string,
    queueId: string,
  ): Promise<void>;

  // Resource operations
  abstract fetchResources(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
    resourceType?: string,
  ): Promise<ResourcesPageResponseDto>;

  abstract createResource(
    sysAdminAccessToken: string,
    resource: ResourceCreateDto,
  ): Promise<ResourceDto>;

  abstract deleteResource(
    sysAdminAccessToken: string,
    resourceId: string,
    force?: boolean,
  ): Promise<void>;

  abstract downloadResource(
    sysAdminAccessToken: string,
    resourceId: string,
  ): Promise<Buffer>;
}
