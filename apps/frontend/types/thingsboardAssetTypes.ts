export interface EntityId {
  id?: string;
  entityType?: string;
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
  assetProfileId: string;
  customerId: string;
  description?: string;
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
  type?: string;
  defaultRuleChainId?: EntityId | null;
  defaultDashboardId?: EntityId | null;
  defaultQueueName?: string | null;
  defaultEdgeRuleChainId?: EntityId | null;
  externalId?: string | null;
  version: number;
  default: boolean;
  profileData?: {
    configuration?: {
      type?: string;
    };
  };
}

export interface AssetProfileExport {
  name: string;
  description?: string | null;
  image?: string | null;
  defaultRuleChainId?: EntityId | null;
  defaultDashboardId?: EntityId | null;
  defaultQueueName?: string | null;
  defaultEdgeRuleChainId?: EntityId | null;
  default: false;
}

export interface AssetProfilesResponse {
  data: AssetProfile[];
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
