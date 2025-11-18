export interface PostTelemetryResult {
  status: 'SUCCESS' | 'PARTIAL' | 'FAIL';
  deviceId: string;
  patientRef: string;
  counts: {
    total: number;
    saved: number;
    failed: number;
  };
}
