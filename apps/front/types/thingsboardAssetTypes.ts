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

export interface CustomerInfo {
  id: EntityId;
  createdTime: number;
  title: string;
  tenantId: EntityId;
  additionalInfo?: {
    isPublic?: boolean;
  };
}

export interface CustomersResponse {
  data: CustomerInfo[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}
