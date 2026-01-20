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
  | UnsubscribeCommand;

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
  cmdUpdateType: 'ENTITY_DATA' | 'COUNT_DATA';
}
