// ============================================================================
// WebSocket Command Types
// ============================================================================

export type WebSocketCommandType =
  | 'ENTITY_COUNT'
  | 'ENTITY_DATA'
  | 'TIMESERIES';

export type EntityFilterType =
  | 'entityType'
  | 'apiUsageState'
  | 'singleEntity'
  | 'entityList'
  | 'deviceType';

export type EntityType =
  | 'TENANT'
  | 'DEVICE'
  | 'USER'
  | 'ASSET'
  | 'CUSTOMER'
  | 'DASHBOARD'
  | 'API_USAGE_STATE';

// ============================================================================
// Entity Filter
// ============================================================================

export interface EntityFilter {
  type: EntityFilterType;
  resolveMultiple: boolean;
  entityType?: EntityType;
}

// ============================================================================
// Page Link
// ============================================================================

export interface PageLink {
  page: number;
  pageSize: number;
  textSearch?: string | null;
  dynamic?: boolean;
  sortOrder?: {
    key: { type: string; key: string };
    direction: 'ASC' | 'DESC';
  };
}

// ============================================================================
// Entity Fields & Latest Values
// ============================================================================

export interface EntityField {
  type: 'ENTITY_FIELD';
  key: string;
}

export interface LatestValueKey {
  type: 'TIME_SERIES' | 'ATTRIBUTE';
  key: string;
}

// ============================================================================
// WebSocket Commands
// ============================================================================

export interface EntityCountQuery {
  entityFilter: EntityFilter;
}

export interface EntityDataQuery {
  entityFilter: EntityFilter;
  pageLink: PageLink;
  entityFields?: EntityField[];
  latestValues?: LatestValueKey[];
  keyFilters?: any[];
}

export interface LatestCmd {
  keys: LatestValueKey[];
}

//=====================
export interface TimeseriesCmd {
  keys: string[];
  startTs: number;
  timeWindow: number;
  interval: number;
  intervalType: 'MILLISECONDS' | 'SECONDS' | 'MINUTES';
  limit: number;
  timeZoneId?: string;
  agg: 'AVG' | 'SUM' | 'MIN' | 'MAX' | 'COUNT' | 'NONE';
}

export interface HistoryCmd {
  keys: string[];
  startTs: number;
  endTs: number;
  interval: number;
  intervalType: 'MILLISECONDS' | 'SECONDS' | 'MINUTES';
  limit: number;
  timeZoneId?: string;
  agg: 'AVG' | 'SUM' | 'MIN' | 'MAX' | 'COUNT' | 'NONE';
}

export interface EntityCountCommand {
  type: 'ENTITY_COUNT';
  query: EntityCountQuery;
  cmdId: number;
}

export interface EntityDataCommand {
  type: 'ENTITY_DATA';
  query?: EntityDataQuery;
  latestCmd?: LatestCmd;
  tsCmd?: TimeseriesCmd;
  historyCmd?: HistoryCmd;
  cmdId: number;
}

export interface EntityCountUnsubscribeCommand {
  cmdId: number;
  type: 'ENTITY_COUNT_UNSUBSCRIBE';
}

export interface EntityDataUnsubscribeCommand {
  cmdId: number;
  type: 'ENTITY_DATA_UNSUBSCRIBE';
}

export type UnsubscribeCommand =
  | EntityCountUnsubscribeCommand
  | EntityDataUnsubscribeCommand;

export type TelemetryCommand =
  | EntityCountCommand
  | EntityDataCommand
  | UnsubscribeCommand
  | NotificationCountCommand
  | NotificationsCommand
  | MarkNotificationsReadCommand;

export interface WebSocketMessage {
  cmds?: TelemetryCommand[];
  authCmd?: AuthCommand;
}

export interface AuthCommand {
  cmdId: 0;
  token: string;
}

// ============================================================================
// WebSocket Response Types
// ============================================================================

export interface TelemetryTimestamp {
  ts: number;
  value: string;
}

export interface EntityLatest {
  TIME_SERIES?: Record<string, TelemetryTimestamp>;
  ENTITY_FIELD?: Record<string, TelemetryTimestamp>;
  ATTRIBUTE?: Record<string, TelemetryTimestamp>;
}

export interface EntityDataItem {
  entityId: {
    entityType: EntityType;
    id: string;
  };
  latest?: EntityLatest;
  timeseries?: Record<string, TelemetryTimestamp[]>;
  aggLatest?: Record<string, any>;
}

export interface EntityDataResponse {
  data: EntityDataItem[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface EntityCountResponse {
  count: number;
}

export interface TelemetryResponse {
  cmdId: number;
  data?: EntityDataResponse | EntityCountResponse | null;
  update?: EntityDataItem[] | null;
  count?: number;
  errorCode: number;
  errorMsg: string | null;
  allowedEntities?: number;
  cmdUpdateType:
    | 'ENTITY_DATA'
    | 'COUNT_DATA'
    | 'NOTIFICATIONS_COUNT'
    | 'NOTIFICATIONS';
}

// ============================================================================
// Notification Types
// ============================================================================

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
}

export interface NotificationsResponse {
  cmdId: number;
  errorCode: number;
  errorMsg: string | null;
  notifications: Notification[];
  totalUnreadCount: number;
  sequenceNumber: number;
  cmdUpdateType: 'NOTIFICATIONS';
}

export interface NotificationsCountResponse {
  cmdId: number;
  errorCode: number;
  errorMsg: string | null;
  totalUnreadCount: number;
  sequenceNumber: number;
  cmdUpdateType: 'NOTIFICATIONS_COUNT';
}

export interface NotificationCountCommand {
  type: 'NOTIFICATIONS_COUNT';
  cmdId: number;
}

export interface NotificationsCommand {
  type: 'NOTIFICATIONS';
  limit: number;
  types?: string[];
  cmdId: number;
}

export interface MarkNotificationsReadCommand {
  type: 'MARK_NOTIFICATIONS_AS_READ';
  notifications: string[]; // array of notification IDs
  cmdId: number;
}
