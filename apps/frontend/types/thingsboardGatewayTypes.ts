export interface GatewayEntityId {
  id?: string;
  entityType?: string;
}

export interface GatewayListItem {
  id: GatewayEntityId;
  createdTime: number;
  name: string;
  type: string;
  label: string | null;
  version: number;
  active: boolean;
  deviceProfileName?: string;
  additionalInfo?: {
    gateway?: boolean;
    overwriteActivityTime?: boolean;
    description?: string;
  } | null;
  enabledConnectors: number;
  gatewayVersion: string | null;
}

export interface GatewaysResponse {
  data: GatewayListItem[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}
