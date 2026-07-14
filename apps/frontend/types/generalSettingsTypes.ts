export interface EntityIdType {
  entityType: string;
  id: string;
}

export interface TenantIdType {
  entityType: string;
  id: string;
}

export interface GeneralSettingsJsonValue {
  baseUrl: string;
  prohibitDifferentUrl: boolean;
}

export interface GeneralSettingsDto {
  id: EntityIdType;
  createdTime: number;
  tenantId: TenantIdType;
  key: string;
  jsonValue: GeneralSettingsJsonValue;
}

export interface ProtocolConfig {
  enabled: boolean;
  host: string;
  port: string | number;
}

export interface ConnectivityJsonValue {
  http: ProtocolConfig;
  https: ProtocolConfig;
  mqtt: ProtocolConfig;
  mqtts: ProtocolConfig;
  coap: ProtocolConfig;
  coaps: ProtocolConfig;
}

export interface ConnectivitySettingsDto {
  id: EntityIdType;
  createdTime: number;
  tenantId: TenantIdType;
  key: string;
  jsonValue: ConnectivityJsonValue;
}
