import { OperationStatus } from '../enums/operation-status.enum';

export interface PostTelemetryResult {
  status: OperationStatus;
  deviceId: string;
  patientRef: string;
  counts: {
    total: number;
    saved: number;
    failed: number;
  };
}
