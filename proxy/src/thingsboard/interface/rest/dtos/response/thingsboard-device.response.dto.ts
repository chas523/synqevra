import { EntityId } from 'src/thingsboard/infrastructure/http/thingsboard.api.types';

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
