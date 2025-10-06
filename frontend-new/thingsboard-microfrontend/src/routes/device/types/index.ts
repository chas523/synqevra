import type { EntityId } from '@/routes/rulechain/types/RuleChainTypes';

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

// export interface DeviceTelemetryKeys {
//   lastUpdateTs: number;
//   key: "telemetry_keys";
//   value: string[];
// }

// export interface DeviceLimits {
//   lastUpdateTs: number;
//   key: "limits";
//   value: Record<string, number>;
// }

export type DeviceAttributes = DeviceTelemetryAttribute[];
