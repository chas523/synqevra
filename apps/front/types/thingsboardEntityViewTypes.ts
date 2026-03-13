export interface EntityId {
  id?: string;
  entityType?: string;
}

export interface EntityView {
  id: EntityId;
  createdTime: number;
  entityId: EntityId;
  tenantId: EntityId;
  customerId?: EntityId;
  name: string;
  label?: string | null;
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

export interface CreateEntityViewRequest {
  name: string;
  type: string;
  entityType: "DEVICE" | "ASSET";
  entityId: string;
  description?: string;
  clientAttributes?: string[];
  sharedAttributes?: string[];
  serverAttributes?: string[];
  timeSeries?: string[];
  startTimeMs?: number;
  endTimeMs?: number;
}

export interface EntityViewTypeOption {
  tenantId?: EntityId;
  entityType?: string;
  type: string;
}

export interface EntityViewSourceOption {
  id: string;
  name: string;
}
