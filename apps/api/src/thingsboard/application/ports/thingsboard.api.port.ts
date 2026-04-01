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
} from '../../interface/rest/dtos/response/notification-rule.response.dto';
import {
  CreateWidgetTypeRequestDto,
  WidgetTypeDto,
  WidgetTypesPageDto,
} from 'src/thingsboard/interface/rest/dtos/response/widget-types.response.dto';
import {
  WidgetBundleDto,
  WidgetBundlesPageDto,
} from 'src/thingsboard/interface/rest/dtos/response/widget-bundles.response.dto';
import { ImagesPageResponseDto } from 'src/thingsboard/interface/rest/dtos/response/image.response.dto';
import { SaveWidgetBundleRequestDto } from 'src/thingsboard/interface/rest/dtos/request/save-widget-bundle.request.dto';
import { TwoFactorAuthSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-2fa-settings.response.dto';
import { TwoFactorAuthSettingsRequestDto } from 'src/thingsboard/interface/rest/dtos/request/thingsboard-2fa-settings.request.dto';
import {
  OtaPackageDto,
  OtaPackagesPageResponseDto,
} from 'src/thingsboard/interface/rest/dtos/response/ota-package.response.dto';
import { CreateOtaPackageRequestDto } from 'src/thingsboard/interface/rest/dtos/request/create-ota-package.request.dto';

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
    username?: string,
    password?: string,
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
  abstract updateTenant(
    tenantData: UpdateTenantDto,
    sysAdminAccessToken: string,
  ): Promise<TenantResponse>;
  abstract deleteTenantAdmin(
    tenantAdminId: string,
    sysAdminAccessToken: string,
  ): Promise<void>;

  abstract createNotificationTarget(
    sysAdminAccessToken: string,
    targetData: CreateNotificationTargetRequestDto,
  ): Promise<NotificationTargetDto>;

  abstract createNotificationTemplate(
    sysAdminAccessToken: string,
    templateData: CreateNotificationTemplateRequestDto,
  ): Promise<NotificationTemplateDto>;

  // Notification operations
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
  abstract getRootRuleChain(accessToken: string): Promise<EntityId>;
  abstract createRuleChain(
    name: string,
    type: string,
    debugMode: boolean,
    accessToken: string,
  ): Promise<EntityId>;
  abstract getRuleChain(ruleChainId: string, accessToken: string): Promise<any>;
  abstract getRuleChainMetadata(
    ruleChainId: string,
    accessToken: string,
  ): Promise<any>;
  abstract updateRuleChainMetadata(
    ruleChainId: EntityId,
    metadata: any,
    accessToken: string,
  ): Promise<void>;
  abstract setRootRuleChain(
    accessToken: string,
    ruleChainId: string,
  ): Promise<any>;
  abstract deleteRuleChain(
    accessToken: string,
    ruleChainId: string,
  ): Promise<void>;
  abstract createRuleChainFull(accessToken: string, payload: any): Promise<any>;
  abstract getDefaultDeviceProfile(accessToken: string): Promise<EntityId>;
  abstract getDeviceProfile(
    deviceProfileId: string,
    accessToken: string,
    inlineImages?: boolean,
  ): Promise<any>;
  abstract updateDeviceProfile(
    deviceProfile: any,
    accessToken: string,
  ): Promise<void>;
  abstract makeDeviceProfileDefault(
    accessToken: string,
    deviceProfileId: string,
  ): Promise<void>;
  abstract deleteDeviceProfile(
    accessToken: string,
    deviceProfileId: string,
  ): Promise<void>;

  // Device operations
  abstract fetchDevices(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: 'ASC' | 'DESC',
  ): Promise<DevicesResponse>;
  abstract fetchDevice(accessToken: string, id: string): Promise<DeviceDetails>;
  abstract saveDevice(
    accessToken: string,
    payload: Partial<DeviceDetails> & { id: EntityId },
  ): Promise<DeviceDetails>;
  abstract createDevice(
    accessToken: string,
    payload: CreateDeviceRequest,
    userId: number,
  ): Promise<Device>;
  abstract deleteDevice(accessToken: string, id: string): Promise<void>;
  abstract makeDevicePublic(accessToken: string, id: string): Promise<any>;
  abstract makeDevicePrivate(accessToken: string, id: string): Promise<any>;
  abstract getDeviceCredentials(
    accessToken: string,
    deviceId: string,
  ): Promise<any>;
  abstract saveDeviceCredentials(
    accessToken: string,
    credentials: any,
  ): Promise<any>;
  abstract fetchDeviceSharedAttributes(
    accessToken: string,
    id: string,
  ): Promise<DeviceAttributes>;
  abstract updateDeviceSharedAttributes(
    accessToken: string,
    id: string,
    attributes: Record<string, any>,
  ): Promise<void>;
  abstract fetchGatewayDockerCompose(
    accessToken: string,
    deviceId: string,
  ): Promise<Buffer>;
  abstract addDeviceLatestTelemetry(
    accessToken: string,
    id: string,
    telemetry: Record<string, unknown>,
  ): Promise<void>;
  abstract fetchDeviceTelemetryKeys(
    accessToken: string,
    id: string,
  ): Promise<string[]>;
  abstract fetchTimeseriesKeysByDeviceType(
    accessToken: string,
    deviceType: string,
  ): Promise<string[]>;
  abstract fetchDeviceProfileDeviceAttributeKeys(
    accessToken: string,
    deviceProfileId: string,
  ): Promise<string[]>;
  abstract fetchDeviceProfileDeviceTimeseriesKeys(
    accessToken: string,
    deviceProfileId: string,
  ): Promise<string[]>;
  abstract fetchDeviceProfileInfosWithTextSearch(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: 'ASC' | 'DESC',
    textSearch?: string,
  ): Promise<any>;
  abstract fetchOtaPackagesWithTextSearch(
    accessToken: string,
    type: 'FIRMWARE' | 'SOFTWARE',
    deviceProfileId: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: 'ASC' | 'DESC',
    textSearch?: string,
  ): Promise<any>;

  abstract fetchDeviceCalculatedFields(
    accessToken: string,
    id: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: 'ASC' | 'DESC',
  ): Promise<DeviceCalculatedFieldsResponse>;

  abstract fetchDeviceProfileCalculatedFields(
    accessToken: string,
    id: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: 'ASC' | 'DESC',
  ): Promise<DeviceCalculatedFieldsResponse>;

  abstract fetchAssetProfileCalculatedFields(
    accessToken: string,
    id: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: 'ASC' | 'DESC',
  ): Promise<DeviceCalculatedFieldsResponse>;

  abstract createCalculatedField(
    accessToken: string,
    payload: CreateCalculatedFieldPayload,
  ): Promise<DeviceCalculatedField>;

  // Asset operations
  abstract fetchAssets(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: 'ASC' | 'DESC',
    assetProfileId?: string,
  ): Promise<AssetsResponse>;
  abstract createAsset(
    accessToken: string,
    payload: CreateAssetRequest,
  ): Promise<Asset>;
  abstract fetchAsset(accessToken: string, id: string): Promise<Asset>;
  abstract saveAsset(
    accessToken: string,
    payload: Partial<Asset> & { id: EntityId },
  ): Promise<Asset>;
  abstract addAssetLatestTelemetry(
    accessToken: string,
    id: string,
    telemetry: Record<string, unknown>,
  ): Promise<void>;
  abstract fetchAssetTelemetryKeys(
    accessToken: string,
    id: string,
  ): Promise<string[]>;
  abstract fetchAssetLatestTelemetry(
    accessToken: string,
    id: string,
    keys: string[],
  ): Promise<LatestTelemetryResponse>;
  abstract fetchAssetCalculatedFields(
    accessToken: string,
    id: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: 'ASC' | 'DESC',
  ): Promise<DeviceCalculatedFieldsResponse>;
  abstract makeAssetPublic(accessToken: string, id: string): Promise<Asset>;
  abstract makeAssetPrivate(accessToken: string, id: string): Promise<Asset>;
  abstract deleteAsset(accessToken: string, id: string): Promise<void>;
  abstract fetchAssetProfileInfo(
    accessToken: string,
    profileName: string,
  ): Promise<AssetProfileInfo>;
  abstract getAssetProfile(
    assetProfileId: string,
    accessToken: string,
    inlineImages?: boolean,
  ): Promise<any>;
  abstract fetchAssetProfileInfos(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: 'ASC' | 'DESC',
    textSearch?: string,
  ): Promise<AssetProfileInfosResponse>;
  abstract fetchAssetProfiles(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: 'ASC' | 'DESC',
    textSearch?: string,
  ): Promise<AssetProfilesResponse>;
  abstract saveAssetProfile(accessToken: string, payload: any): Promise<any>;
  abstract makeAssetProfileDefault(
    accessToken: string,
    assetProfileId: string,
  ): Promise<void>;
  abstract deleteAssetProfile(
    accessToken: string,
    assetProfileId: string,
  ): Promise<void>;
  abstract fetchAttributeKeysByAssetTypeAndScope(
    accessToken: string,
    assetType: string,
    scope: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE',
  ): Promise<string[]>;
  abstract fetchTimeseriesKeysByAssetType(
    accessToken: string,
    assetType: string,
  ): Promise<string[]>;
  abstract fetchCustomers(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: 'ASC' | 'DESC',
    textSearch?: string,
  ): Promise<CustomersResponse>;
  abstract fetchCustomer(
    accessToken: string,
    customerId: string,
  ): Promise<CustomerDetails>;
  abstract deleteCustomer(
    accessToken: string,
    customerId: string,
  ): Promise<void>;
  abstract fetchCustomerTelemetryKeys(
    accessToken: string,
    id: string,
  ): Promise<string[]>;
  abstract fetchCustomerLatestTelemetry(
    accessToken: string,
    id: string,
    keys: string[],
  ): Promise<LatestTelemetryResponse>;
  abstract addCustomerLatestTelemetry(
    accessToken: string,
    id: string,
    telemetry: Record<string, unknown>,
  ): Promise<void>;

  // Entity View operations
  abstract fetchEntityViews(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: 'ASC' | 'DESC',
    type?: string,
  ): Promise<EntityViewsResponse>;
  abstract fetchEntityViewTypes(
    accessToken: string,
  ): Promise<EntityViewTypeInfo[]>;
  abstract createEntityView(
    accessToken: string,
    payload: CreateEntityViewRequest,
  ): Promise<EntityView>;
  abstract fetchEntityView(
    accessToken: string,
    id: string,
  ): Promise<EntityView>;
  abstract saveEntityView(
    accessToken: string,
    payload: Partial<EntityView> & { id: EntityId },
  ): Promise<EntityView>;
  abstract fetchEntityViewTelemetryKeys(
    accessToken: string,
    id: string,
  ): Promise<string[]>;
  abstract fetchEntityViewLatestTelemetry(
    accessToken: string,
    id: string,
    keys: string[],
  ): Promise<LatestTelemetryResponse>;
  abstract makeEntityViewPublic(
    accessToken: string,
    id: string,
  ): Promise<EntityView>;
  abstract makeEntityViewPrivate(
    accessToken: string,
    id: string,
  ): Promise<EntityView>;
  abstract deleteEntityView(accessToken: string, id: string): Promise<void>;

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
  abstract fetchDeliveryMethods(
    sysAdminAccessToken: string,
  ): Promise<DeliveryMethodsResponse>;
  abstract fetchNotificationRequests(
    sysAdminAccessToken: string,
    params: {
      pageSize?: number;
      page?: number;
      sortProperty?: string;
      sortOrder?: string;
    },
  ): Promise<any>;
  abstract sendNotification(
    sysAdminAccessToken: string,
    notificationRequest: SendNotificationRequestDto,
  ): Promise<NotificationRequestResponse>;
  abstract fetchNotificationTargets(
    sysAdminAccessToken: string,
    params: {
      pageSize?: number;
      page?: number;
      sortProperty?: string;
      sortOrder?: string;
    },
  ): Promise<NotificationTargetsResponse>;
  abstract previewNotificationRequest(
    sysAdminAccessToken: string,
    previewRequest: any,
  ): Promise<any>;
  abstract fetchMaterialIcons(sysAdminAccessToken: string): Promise<string[]>;

  abstract fetchNotificationTemplates(
    sysAdminAccessToken: string,
    params: {
      pageSize?: number;
      page?: number;
      sortProperty?: string;
      sortOrder?: string;
      notificationTypes?: string;
    },
  ): Promise<NotificationTemplatesResponse>;

  abstract fetchNotificationRules(
    sysAdminAccessToken: string,
    params: {
      pageSize?: number;
      page?: number;
      sortProperty?: string;
      sortOrder?: string;
    },
  ): Promise<NotificationRulesResponse>;

  abstract saveNotificationRule(
    sysAdminAccessToken: string,
    rule: CreateNotificationRuleRequestDto,
  ): Promise<NotificationRuleDto>;

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

  abstract fetchRuleChains(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
    type?: 'CORE' | 'EDGE',
  ): Promise<any>;

  abstract fetchQueueByName(
    accessToken: string,
    queueName: string,
  ): Promise<QueueDto>;

  abstract fetchRuleChainById(
    accessToken: string,
    ruleChainId: string,
  ): Promise<any>;

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
    resourceSubType?: string,
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

  abstract fetchResourceInfo(
    sysAdminAccessToken: string,
    resourceId: string,
  ): Promise<ResourceDto>;

  abstract fetchLwm2mObjectsPage(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
    textSearch?: string,
  ): Promise<any[]>;

  // Tenant detail operations
  abstract fetchTenantAttributes(
    sysAdminAccessToken: string,
    tenantId: string,
    scope: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE',
  ): Promise<TenantAttributesResponse>;

  abstract fetchEntityAttributes(
    sysAdminAccessToken: string,
    entityType: string,
    entityId: string,
    scope: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE',
    keys?: string[],
  ): Promise<TenantAttributesResponse>;

  abstract fetchEntityAttributeKeys(
    sysAdminAccessToken: string,
    entityType: string,
    entityId: string,
  ): Promise<string[]>;

  abstract fetchAttributeKeysByDeviceTypeAndScope(
    accessToken: string,
    deviceType: string,
    scope: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE',
  ): Promise<string[]>;

  abstract fetchEntityKeysBySingleEntity(
    accessToken: string,
    entityType: string,
    entityId: string,
    options: {
      attributes: boolean;
      timeseries: boolean;
      scope?: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE';
    },
  ): Promise<string[]>;

  abstract fetchEntityAlarms(
    sysAdminAccessToken: string,
    entityType: string,
    entityId: string,
    page: number,
    pageSize: number,
    statusList?: string[],
    severityList?: string[],
    startTime?: number,
    endTime?: number,
  ): Promise<EntityAlarmsResponse>;

  abstract fetchEntityEvents(
    sysAdminAccessToken: string,
    entityType: string,
    entityId: string,
    page: number,
    pageSize: number,
    eventType?: string,
    startTime?: number,
    endTime?: number,
  ): Promise<EntityEventsResponse>;

  abstract fetchEntityEventsByQuery(
    accessToken: string,
    entityType: string,
    entityId: string,
    tenantId: string,
    eventType: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: 'ASC' | 'DESC',
    startTime?: number,
    endTime?: number,
  ): Promise<EntityEventsResponse>;

  abstract fetchEntityAuditLogs(
    accessToken: string,
    entityType: string,
    entityId: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: 'ASC' | 'DESC',
    startTime?: number,
    endTime?: number,
  ): Promise<EntityAuditLogsResponse>;

  abstract fetchDeviceLatestTelemetry(
    accessToken: string,
    id: string,
    keys: string[],
  ): Promise<LatestTelemetryResponse>;

  abstract fetchEntityRelations(
    sysAdminAccessToken: string,
    entityType: string,
    entityId: string,
    direction: 'FROM' | 'TO',
  ): Promise<EntityRelationsResponse>;

  abstract saveEntityAttributes(
    sysAdminAccessToken: string,
    entityType: string,
    entityId: string,
    scope: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE',
    attributes: Record<string, unknown>,
  ): Promise<void>;

  abstract saveRelation(
    sysAdminAccessToken: string,
    relation: RelationInfo,
  ): Promise<void>;

  abstract deleteRelation(
    sysAdminAccessToken: string,
    fromId: string,
    fromType: string,
    relationType: string,
    toId: string,
    toType: string,
  ): Promise<void>;

  abstract fetchTenantProfiles(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: string,
    textSearch?: string,
  ): Promise<TenantProfilesResponse>;

  abstract saveTenantProfile(
    accessToken: string,
    tenantProfile: TenantProfile,
  ): Promise<TenantProfile>;

  // Image operations

  abstract uploadImage(
    sysAdminAccessToken: string,
    file: Buffer,
    fileName: string,
    title: string,
    imageSubType: string,
  ): Promise<any>;

  abstract deleteImage(
    sysAdminAccessToken: string,
    imageLink: string,
    force: boolean,
  ): Promise<any>;

  abstract downloadImage(
    sysAdminAccessToken: string,
    imageLink: string,
  ): Promise<Buffer>;

  abstract exportImage(
    sysAdminAccessToken: string,
    imageLink: string,
  ): Promise<any>;

  // Mail Settings operations
  abstract fetchMailSettings(
    sysAdminAccessToken: string,
  ): Promise<MailSettingsDto>;

  abstract updateMailSettings(
    sysAdminAccessToken: string,
    settings: MailSettingsDto,
  ): Promise<MailSettingsDto>;

  // Widget Type operations
  abstract fetchWidgetTypes(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
    tenantOnly: boolean,
    fullSearch: boolean,
    scadaFirst: boolean,
    deprecatedFilter: string,
    widgetsBundleId?: string,
  ): Promise<WidgetTypesPageDto>;

  abstract deleteWidgetType(
    sysAdminAccessToken: string,
    widgetTypeId: string,
  ): Promise<void>;

  abstract saveWidgetType(
    sysAdminAccessToken: string,
    widgetType: any,
    updateExistingByFqn?: boolean,
  ): Promise<WidgetTypeDto>;

  abstract fetchWidgetTypeById(
    sysAdminAccessToken: string,
    widgetTypeId: string,
  ): Promise<WidgetTypeDto>;

  abstract fetchWidgetBundleById(
    sysAdminAccessToken: string,
    widgetsBundleId: string,
  ): Promise<WidgetBundleDto>;

  abstract downloadWidgetType(
    sysAdminAccessToken: string,
    widgetTypeId: string,
    includeResources?: boolean,
  ): Promise<any>;

  abstract fetchWidgetBundles(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
    tenantOnly: boolean,
    fullSearch: boolean,
    scadaFirst: boolean,
  ): Promise<WidgetBundlesPageDto>;

  abstract fetchImages(
    sysAdminAccessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
    imageSubType: string,
    includeSystemImages: boolean,
    textSearch?: string,
  ): Promise<ImagesPageResponseDto>;

  abstract saveWidgetBundle(
    sysAdminAccessToken: string,
    widgetBundle: SaveWidgetBundleRequestDto,
  ): Promise<WidgetBundleDto>;
  abstract fetchTwoFaSettings(
    sysAdminAccessToken: string,
  ): Promise<TwoFactorAuthSettingsDto>;

  abstract saveTwoFaSettings(
    sysAdminAccessToken: string,
    settings: TwoFactorAuthSettingsRequestDto,
  ): Promise<void>;

  abstract getWidgetsBundles(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
    tenantOnly: boolean,
    fullSearch: boolean,
    scadaFirst: boolean,
    deprecatedFilter: string,
  ): Promise<any>;

  abstract getWidgetTypeFqns(
    accessToken: string,
    widgetsBundleId: string,
  ): Promise<any>;

  abstract saveWidgetTypeFqns(
    accessToken: string,
    widgetsBundleId: string,
    fqns: string[],
  ): Promise<any>;

  // OTA Package operations
  abstract fetchOtaPackages(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
  ): Promise<OtaPackagesPageResponseDto>;

  abstract createOtaPackage(
    accessToken: string,
    payload: CreateOtaPackageRequestDto,
  ): Promise<OtaPackageDto>;

  abstract deleteOtaPackage(accessToken: string, id: string): Promise<void>;

  abstract downloadOtaPackage(accessToken: string, id: string): Promise<Buffer>;

  abstract fetchDeviceProfileInfos(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
  ): Promise<any>;

  abstract fetchDeviceProfiles(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC',
    textSearch?: string,
  ): Promise<DeviceProfilesResponse>;

  // Version Control operations
  abstract getRepoSettingsInfo(accessToken: string): Promise<any>;

  abstract getRepoSettings(accessToken: string): Promise<any>;

  abstract checkRepoAccess(accessToken: string, payload: any): Promise<any>;

  abstract saveRepoSettings(accessToken: string, payload: any): Promise<any>;

  abstract fetchVersions(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: string,
    branch: string,
  ): Promise<any>;

  abstract fetchEntityVersions(
    accessToken: string,
    entityType: string,
    id: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: string,
    branch: string,
  ): Promise<any>;

  abstract deleteRepoSettings(accessToken: string): Promise<any>;

  abstract getBranches(accessToken: string): Promise<any>;

  abstract getTrendzSettings(accessToken: string): Promise<any>;

  abstract saveTrendzSettings(accessToken: string, payload: any): Promise<any>;

  // AI Model operations
  abstract getAiModels(
    accessToken: string,
    page: number,
    pageSize: number,
    sortProperty: string,
    sortOrder: string,
  ): Promise<any>;

  abstract saveAiModel(accessToken: string, payload: any): Promise<any>;

  abstract deleteAiModel(accessToken: string, modelId: string): Promise<any>;

  abstract checkAiModelConnectivity(
    accessToken: string,
    payload: any,
  ): Promise<any>;

  // Auto-commit settings
  abstract getAutoCommitSettings(accessToken: string): Promise<any>;

  abstract saveAutoCommitSettings(
    accessToken: string,
    payload: any,
  ): Promise<any>;

  abstract deleteAutoCommitSettings(accessToken: string): Promise<any>;

  // Version creation & entity listing
  abstract createVersion(accessToken: string, payload: any): Promise<string>;
  abstract getVersionCreationStatus(
    accessToken: string,
    requestId: string,
  ): Promise<any>;
  abstract restoreVersion(accessToken: string, payload: any): Promise<string>;
  abstract getRestoreVersionStatus(
    accessToken: string,
    requestId: string,
  ): Promise<any>;

  abstract getVersionEntityInfo(
    accessToken: string,
    versionId: string,
    entityType: string,
    entityId: string,
  ): Promise<any>;

  // Dashboards
  abstract fetchTenantDashboards(
    accessToken: string,
    pageSize: number,
    page: number,
    sortProperty?: string,
    sortOrder?: string,
  ): Promise<any>;
  abstract fetchDashboardById(
    accessToken: string,
    id: string,
    includeResources?: boolean,
  ): Promise<any>;
  abstract makeDashboardCustomerPublic(
    accessToken: string,
    id: string,
  ): Promise<any>;
  abstract makeDashboardCustomerPrivate(
    accessToken: string,
    id: string,
  ): Promise<any>;

  abstract saveDashboard(accessToken: string, dashboard: any): Promise<any>;

  abstract updateDashboardCustomers(
    accessToken: string,
    dashboardId: string,
    customerIds: string[],
  ): Promise<any>;

  abstract fetchCustomerById(accessToken: string, id: string): Promise<any>;

  abstract deleteDashboard(accessToken: string, id: string): Promise<void>;

  abstract fetchDashboardAuditLogs(
    accessToken: string,
    id: string,
    page: number,
    pageSize: number,
    sortProperty?: string,
    sortOrder?: string,
    startTime?: number,
    endTime?: number,
  ): Promise<any>;

  abstract getEntitiesByType(
    accessToken: string,

    entityType: string,
    page: number,
    pageSize: number,
  ): Promise<any>;

  // Audit logs
  abstract getAuditLogs(
    accessToken: string,
    params: {
      pageSize: number;
      page: number;
      sortProperty: string;
      sortOrder: string;
      startTime: number;
      endTime: number;
    },
  ): Promise<any>;

  // OAuth2 / Domains
  abstract getDomainInfos(
    accessToken: string,
    params: {
      pageSize: number;
      page: number;
      sortProperty: string;
      sortOrder: string;
    },
  ): Promise<any>;
  abstract getOAuth2ClientInfos(
    accessToken: string,
    params: {
      pageSize: number;
      page: number;
      sortProperty: string;
      sortOrder: string;
    },
  ): Promise<any>;
  abstract getOAuth2ClientById(accessToken: string, id: string): Promise<any>;
  abstract createDomain(
    accessToken: string,
    payload: { name: string; oauth2Enabled: boolean; propagateToEdge: boolean },
    oauth2ClientIds: string[],
  ): Promise<any>;
  abstract getDomainById(accessToken: string, domainId: string): Promise<any>;
  abstract updateDomain(
    accessToken: string,
    domainId: string,
    payload: { name: string; oauth2Enabled: boolean; propagateToEdge: boolean },
    oauth2ClientIds: string[],
  ): Promise<any>;
  abstract getOAuth2ConfigTemplate(accessToken: string): Promise<any>;
  abstract saveOAuth2Client(accessToken: string, payload: any): Promise<any>;
}

// Response types for new methods
export interface TenantAttribute {
  key: string;
  value: unknown;
  lastUpdateTs: number;
}

export type TenantAttributesResponse = TenantAttribute[];

export interface AlarmInfo {
  id: EntityId;
  createdTime: number;
  tenantId: EntityId;
  customerId?: EntityId;
  name: string;
  type: string;
  originator: EntityId;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING' | 'INDETERMINATE';
  status: 'ACTIVE_UNACK' | 'ACTIVE_ACK' | 'CLEARED_UNACK' | 'CLEARED_ACK';
  startTs: number;
  endTs?: number;
  ackTs?: number;
  clearTs?: number;
  propagate?: boolean;
  details?: Record<string, unknown>;
}

export interface EntityAlarmsResponse {
  data: AlarmInfo[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface EventInfo {
  id: EntityId;
  createdTime: number;
  tenantId: EntityId;
  entityId: EntityId;
  serviceId?: string;
  type: string;
  uid: string;
  body: Record<string, unknown>;
}

export interface EntityEventsResponse {
  data: EventInfo[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface AuditLogInfo {
  id: {
    id: string;
  };
  createdTime: number;
  tenantId: EntityId;
  customerId?: EntityId;
  entityId: EntityId;
  entityName?: string;
  userId?: EntityId;
  userName?: string;
  actionType: string;
  actionData?: Record<string, unknown>;
  actionStatus: string;
  actionFailureDetails?: string;
}

export interface EntityAuditLogsResponse {
  data: AuditLogInfo[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface LatestTelemetryValue {
  ts: number;
  value: unknown;
}

export type LatestTelemetryResponse = Record<string, LatestTelemetryValue[]>;

export interface DeviceCalculatedField {
  id: EntityId;
  createdTime: number;
  tenantId: EntityId;
  entityId: EntityId;
  type: string;
  name: string;
  debugSettings?: {
    failuresEnabled?: boolean;
    allEnabled?: boolean;
    allEnabledUntil?: number;
  };
  configurationVersion?: number;
  configuration?: Record<string, unknown>;
  version?: number;
}

export interface DeviceCalculatedFieldsResponse {
  data: DeviceCalculatedField[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface CreateCalculatedFieldPayload {
  entityId: {
    entityType: 'DEVICE' | 'ASSET' | 'DEVICE_PROFILE' | 'ASSET_PROFILE';
    id: string;
  };
  configuration: {
    arguments: Record<string, unknown>;
    useLatestTs: boolean;
    type: string;
    expression: string;
    output: {
      name: string;
      type: string;
      scope?: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE';
      decimalsByDefault: number;
    };
  };
  name: string;
  type: string;
  debugSettings: {
    failuresEnabled: boolean;
    allEnabled: boolean;
  };
}

export interface Asset {
  id: EntityId;
  createdTime: number;
  tenantId: EntityId;
  customerId?: EntityId;
  name: string;
  type: string;
  label: string | null;
  assetProfileId: EntityId;
  externalId?: string | null;
  version: number;
  customerTitle: string | null;
  customerIsPublic: boolean;
  assetProfileName: string;
  additionalInfo?: {
    description?: string;
  };
}

export interface AssetsResponse {
  data: Asset[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface CreateAssetRequest {
  name: string;
  label?: string | null;
  assetProfileId: EntityId;
  customerId: EntityId;
  type?: string;
  additionalInfo?: {
    description?: string;
  };
}

export interface AssetProfileInfo {
  id: EntityId;
  tenantId: EntityId;
  name: string;
  image?: string | null;
  defaultDashboardId?: EntityId | null;
}

export interface AssetProfileInfosResponse {
  data: AssetProfileInfo[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface AssetProfile {
  id: EntityId;
  createdTime: number;
  tenantId: EntityId;
  name: string;
  description?: string | null;
  image?: string | null;
  type: string;
  defaultRuleChainId?: EntityId | null;
  defaultDashboardId?: EntityId | null;
  defaultQueueName?: string | null;
  externalId?: string | null;
  version: number;
  default: boolean;
}

export interface AssetProfilesResponse {
  data: AssetProfile[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface DeviceProfile {
  id: EntityId;
  createdTime: number;
  tenantId: EntityId;
  name: string;
  description?: string | null;
  image?: string | null;
  type: string;
  transportType: string;
  provisionType: string;
  defaultRuleChainId?: EntityId | null;
  defaultDashboardId?: EntityId | null;
  defaultQueueName?: string | null;
  provisionDeviceKey?: string | null;
  firmwareId?: EntityId | null;
  softwareId?: EntityId | null;
  defaultEdgeRuleChainId?: EntityId | null;
  externalId?: string | null;
  version: number;
  default: boolean;
}

export interface DeviceProfilesResponse {
  data: DeviceProfile[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface CustomerInfo {
  id: EntityId;
  createdTime: number;
  title: string;
  email?: string | null;
  country?: string | null;
  city?: string | null;
  name?: string | null;
  tenantId: EntityId;
  additionalInfo?: {
    isPublic?: boolean;
  };
}

export interface CustomerDetails extends CustomerInfo {
  state?: string | null;
  address?: string | null;
  address2?: string | null;
  zip?: string | null;
  phone?: string | null;
  externalId?: string | null;
  version?: number;
}

export interface CustomersResponse {
  data: CustomerInfo[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface EntityView {
  id: EntityId;
  createdTime: number;
  entityId: EntityId;
  tenantId: EntityId;
  customerId?: EntityId;
  name: string;
  type: string;
  keys?: {
    timeseries?: Record<string, unknown> | string[] | null;
    attributes?: Record<string, unknown> | null;
  };
  startTimeMs?: number;
  endTimeMs?: number;
  externalId?: string | null;
  version?: number;
  customerTitle?: string | null;
  customerIsPublic?: boolean;
  additionalInfo?: {
    description?: string;
  };
}

export interface EntityViewsResponse {
  data: EntityView[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface EntityViewTypeInfo {
  tenantId: EntityId;
  entityType: 'ENTITY_VIEW';
  type: string;
}

export interface CreateEntityViewRequest {
  entityId: EntityId;
  name: string;
  type: string;
  keys?: {
    timeseries?: Record<string, unknown> | string[] | null;
    attributes?: Record<string, unknown> | null;
  };
  startTimeMs?: number;
  endTimeMs?: number;
  customerId?: EntityId;
  additionalInfo?: {
    description?: string;
  };
}

export interface RelationInfo {
  from: EntityId;
  to: EntityId;
  type: string;
  typeGroup: string;
  additionalInfo?: Record<string, unknown>;
  fromName?: string;
  toName?: string;
}

export type EntityRelationsResponse = RelationInfo[];

// Tenant update types
export interface UpdateTenantDto {
  id: EntityId;
  title: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  address2?: string;
  zip?: string;
  phone?: string;
  email?: string;
  region?: string;
  tenantProfileId?: EntityId;
  additionalInfo?: Record<string, unknown>;
}

export interface TenantResponse {
  id: EntityId;
  createdTime: number;
  title: string;
  name: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  address2?: string;
  zip?: string;
  phone?: string;
  email?: string;
  region?: string;
  tenantProfileId?: EntityId;
  additionalInfo?: Record<string, unknown>;
  version?: number;
}

export interface TenantProfile {
  id: {
    id: string;
    entityType: string;
  };
  name: string;
  description?: string;
  default: boolean;
  isolatedTbRuleEngine?: boolean;
  createdTime: number;
  profileData?: {
    configuration?: any; // Complex config object
    queueConfiguration?: Array<{
      name: string;
      topic: string;
      pollInterval: number;
      partitions: number;
      consumerPerPartition: boolean;
      packProcessingTimeout: number;
      submitStrategy: {
        type: string;
        batchSize: number;
      };
      processingStrategy: {
        type: string;
        retries: number;
        failurePercentage: number;
        pauseBetweenRetries: number;
        maxPauseBetweenRetries: number;
      };
      additionalInfo?: any;
    }> | null;
  };
}

export interface TenantProfilesResponse {
  data: TenantProfile[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}
