export interface DeviceTelemetryAttribute {
  lastUpdateTs: number;
  key: string;
  value: any;
}

export type DeviceAttributes = DeviceTelemetryAttribute[];
