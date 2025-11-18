export interface PostTelemetryCommand {
  deviceId: string;
  tenantId: string;
  timestamp?: string;
  data: Record<string, number>;
}
