/**
 * WebSocket count entity type
 */

export type EntityType = "TENANT" | "DEVICE" | "USER";

/**
 * entity-count from backend
 */
export interface EntityCountData {
  type: EntityType;
  count: number;
}

/**
 * systemMetricsChart from backend
 */
export interface SystemMetricsData {
  time: string; // "11:05"
  cpu: number; // 2
  ram: number; // 48
  disk: number; // 8
}

/**
 * systemMetricsChart from backend
 */
export interface MsgCount {
  time?: string; // "yyyy-mm-dd"
  value: number; //234
}

/**
 * entity counts
 */
export interface EntityCounts {
  tenants: number;
  devices: number;
  users: number;
}

/**
 * latest (newest) values for system resource chart
 */
export interface LatestSystemMetrics {
  cpu: number;
  ram: number;
  disk: number;
  time?: string;
}

export interface NotificationRequestId {
  entityType: string;
  id: string;
}

export interface NotificationRecipientId {
  entityType: string;
  id: string;
}

export interface NotificationInfo {
  type: string;
  entityId?: {
    entityType: string;
    id: string;
  };
  entityName?: string;
  actionType?: string;
  entityCustomerId?: {
    entityType: string;
    id: string;
  };
  userId?: string;
  userTitle?: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
  stateEntityId?: {
    entityType: string;
    id: string;
  };
  affectedCustomerId?: {
    entityType: string;
    id: string;
  };
  dashboardId?: string;
  status: string;
  id: {
    entityType: string;
    id: string;
  };
  createdTime: number;
}

export interface NotificationAdditionalConfig {
  icon?: {
    enabled: boolean;
    icon: string;
    color: string;
  };
  actionButtonConfig?: {
    enabled: boolean;
    text: string;
    linkType: string;
    link: string;
  };
}

export interface Notification {
  requestId: NotificationRequestId;
  recipientId: NotificationRecipientId;
  type: string;
  deliveryMethod: string;
  subject: string;
  text: string;
  additionalConfig?: NotificationAdditionalConfig;
  info?: NotificationInfo;
  status: string;
  id: {
    entityType: string;
    id: string;
  };
  createdTime: number;
  read?: boolean; // Frontend state
}
