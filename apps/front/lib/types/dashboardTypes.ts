export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  status?: "new" | "pending";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
  total: number;
}
export interface PendingUser extends User {
  status?: "new" | "pending";
}

export interface RequestedAccessUsersRequestOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: "new" | "pending";
  limit?: number;
  afterRef?: string;
  beforeRef?: string;
  [key: string]: unknown;
}

export interface ActiveUsersRequestOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  afterRef?: string;
  beforeRef?: string;
  [key: string]: unknown;
}

export interface MailRecipient {
  firstName: string;
  lastName: string;
  email: string;
}

export interface EntityId {
  entityType: string;
  id: string;
}

export interface Tenant {
  id: {
    entityType: string;
    id: string;
  };
  createdTime?: number;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  address2?: string;
  zip?: string;
  phone?: string;
  email?: string;
  title: string;
  region?: string;
  tenantProfileId: {
    id: {
      entityType: string;
      id: string;
    };
    name: string;
  };
  version?: number;
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: <>
  additionalInfo?: Record<string, any>;
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
    configuration: {
      // Entities limits
      maxDevices?: number;
      maxDashboards?: number;
      maxAssets?: number;
      maxUsers?: number;
      maxCustomers?: number;
      maxRuleChains?: number;
      maxEdges?: number;

      // Rule Engine limits
      maxREExecutions?: number;
      maxTransportMessages?: number;
      maxJSExecutions?: number;
      maxTbelExecutions?: number;
      maxRuleNodeExecutionsPerMessage?: number;
      maxExecuteRateLimit?: number;
      maxTransportDataPoints?: number;

      // Calculated fields
      maxCalculatedFieldsPerEntity?: number;
      maxArgumentsPerCF?: number;
      maxDataPointsPerRollingArg?: number;
      maxStateSizeInKBytes?: number;
      maxSingleValueArgumentSizeInKBytes?: number;

      // Time-to-live
      defaultStorageTtlDays?: number;
      alarmsTtlDays?: number;
      rpcTtlDays?: number;
      queueStatsTtlDays?: number;
      ruleEngineExceptionsTtlDays?: number;
      maxDPStorageDays?: number;

      // Alarms and notifications
      smsEnabled?: boolean | null;
      maxEmails?: number;
      maxSms?: number;
      maxCreatedAlarms?: number;

      // Debug
      maxDebugModeDurationMinutes?: number;

      // WebSocket
      maxWsSessionsPerTenant?: number;
      maxWsSessionsPerCustomer?: number;
      maxWsSessionsPerRegularUser?: number;
      maxWsSessionsPerPublicUser?: number;
      maxWsSubscriptionsPerTenant?: number;
      maxWsSubscriptionsPerCustomer?: number;
      maxWsSubscriptionsPerRegularUser?: number;
      maxWsSubscriptionsPerPublicUser?: number;
      wsMsgQueueLimitPerSession?: number;

      // Rate limits
      transportTenantMsgRateLimit?: string | null;
      transportTenantTelemetryMsgRateLimit?: string | null;
      transportTenantTelemetryDataPointsRateLimit?: string | null;
      transportDeviceMsgRateLimit?: string | null;
      transportDeviceTelemetryMsgRateLimit?: string | null;
      transportDeviceTelemetryDataPointsRateLimit?: string | null;
      transportGatewayMsgRateLimit?: string | null;
      transportGatewayTelemetryMsgRateLimit?: string | null;
      transportGatewayTelemetryDataPointsRateLimit?: string | null;
      transportGatewayDeviceMsgRateLimit?: string | null;
      transportGatewayDeviceTelemetryMsgRateLimit?: string | null;
      transportGatewayDeviceTelemetryDataPointsRateLimit?: string | null;

      // Other limits
      maxResourcesInBytes?: number;
      maxResourceSize?: number;
      maxOtaPackagesInBytes?: number;
      tenantServerRestLimitsConfiguration?: any;
      customerServerRestLimitsConfiguration?: any;
      wsUpdatesPerSessionRateLimit?: string | null;
      cassandraReadQueryTenantRuleEngineRateLimits?: any;
      cassandraReadQueryTenantCoreRateLimits?: any;
      cassandraWriteQueryTenantRuleEngineRateLimits?: any;
      cassandraWriteQueryTenantCoreRateLimits?: any;
      tenantEntityExportRateLimit?: string | null;
      tenantEntityImportRateLimit?: string | null;
      tenantNotificationRequestsRateLimit?: string | null;
      tenantNotificationRequestsPerRuleRateLimit?: string | null;
      edgeEventRateLimits?: string | null;
      edgeEventRateLimitsPerEdge?: string | null;
      edgeUplinkMessagesRateLimits?: string | null;
      edgeUplinkMessagesRateLimitsPerEdge?: string | null;
      warnThreshold?: number;
      type?: string;
    };
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

export interface TenantsRequestOptions extends Record<string, unknown> {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  page?: number;
  afterRef?: string;
  beforeRef?: string;
}

export interface TenantUser {
  id: EntityId;
  createdTime: number;
  tenantId: EntityId;
  customerId?: EntityId;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  version?: number;
  name?: string;
  authority: string;
  // biome-ignore lint/suspicious/noExplicitAny: <>
  additionalInfo?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeviceData extends Record<string, unknown> {
  id: EntityId;
  createdTime: number;
  tenantId: EntityId;
  customerId?: EntityId;
  name: string;
  type: string;
  label?: string | null;
  version?: number;
  deviceProfileName?: string;
  active?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <>
  additionalInfo?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationInfo {
  dashboardId: EntityId;
  stateEntityId: EntityId;
  type: string;
}

export interface Notification {
  requestId: EntityId;
  recipientId: EntityId;
  type?: string;
  deliveryMethod?: string;
  subject?: string;
  text?: string;
  // biome-ignore lint/suspicious/noExplicitAny: <>
  additionalConfig?: Record<string, any>;
  info: NotificationInfo;
  status?: string;
  id: EntityId;
  createdTime?: number;
}

export interface NotificationsRequestOptions extends Record<string, unknown> {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  page?: number;
  afterRef?: string;
  beforeRef?: string;
}
