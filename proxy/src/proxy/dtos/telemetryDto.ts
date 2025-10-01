export class TelemetryDto {
  deviceId: string;
  timestamp?: string;
  data: Record<string, number>;
}
