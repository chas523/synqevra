export interface ThingsboardLoginResponse {
  token: string;
  refreshToken: string;
}
export interface ThingsboardDefaultTenantProfileResponse {
  id: EntityId;
  name: string;
}

export interface EntityId {
  entityType: string;
  id: string;
}

export interface JwtPayload {
  customerId: string;
  tenantId: string;
  userId: string;
}

export interface ThingsboardRollbackData {
  tenantId: EntityId | null;
  userId: string | null;
  sysAdminAccessToken: string;
}

export interface CreateRuleChainRequest {
  name: string;
  type: string;
  debugMode: boolean;
}

export interface RuleChainConnection {
  fromIndex: number;
  toIndex: number;
  type: string;
}

export interface RuleChainMetadata {
  ruleChainId: EntityId;
  firstNodeIndex: number | null;
  nodes: any[];
  connections: RuleChainConnection[];
  //no knowledge what could be inside ruleChainConnections
  ruleChainConnections: null;
}
export interface RuleChain {
  ruleChain: CreateRuleChainRequest;
  metadata: RuleChainMetadata;
}

export interface DeviceProfile {
  id: {
    entityType: 'DEVICE_PROFILE';
    id: string;
  };
  createdTime: number;
  tenantId: {
    entityType: 'TENANT';
    id: string;
  };
  name: string;
  description: string;
  image: string | null;
  type: string;
  transportType: string;
  provisionType: string;
  defaultRuleChainId: {
    entityType: 'RULE_CHAIN';
    id: string;
  } | null;
  defaultDashboardId: any;
  defaultQueueName: string | null;
  provisionDeviceKey: string | null;
  firmwareId: any;
  softwareId: any;
  defaultEdgeRuleChainId: any;
  externalId: any;
  default: boolean;
  profileData: {
    configuration: {
      type: string;
    };
    transportConfiguration: {
      type: string;
    };
    provisionConfiguration: {
      type: string;
      provisionDeviceSecret: string | null;
    };
    alarms: any;
  };
}

export interface Device {
  id: EntityId;
  name: string;
  type: string;
  label: string | null;
  version: number;
  deviceProfileName: string;
  active: boolean;
}

export interface CreateDeviceRequest {
  name: string;
  label: string | null;
}

export interface DeviceDetails {
  id: EntityId;
  createdTime: number;
  tenantId: EntityId;
  customerId: EntityId;
  name: string;
  type: string;
  label: string | null;
  deviceProfileId: EntityId;
  firmwareId: EntityId | null;
  softwareId: EntityId | null;
  externalId: string | null;
  version: number;
  customerTitle: string | null;
  customerIsPublic: boolean;
  deviceProfileName: string;
  active: boolean;
  additionalInfo: {
    gateway: boolean;
    overwriteActivityTime: boolean;
    description: string;
  };
  deviceData: {
    configuration: {
      type: string;
    };
    transportConfiguration: {
      type: string;
    };
  };
}

export interface DeviceTelemetryAttribute {
  lastUpdateTs: number;
  key: string;
  value: any;
}

export type DeviceAttributes = DeviceTelemetryAttribute[];

export interface DevicesResponse {
  data: Device[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}
