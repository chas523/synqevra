import { ApiProperty } from '@nestjs/swagger';

export class TelemetryResponseDto {
  @ApiProperty({
    description: 'Request status',
    enum: ['SUCCESS', 'PARTIAL', 'FAIL'],
  })
  status: 'SUCCESS' | 'PARTIAL' | 'FAIL';

  @ApiProperty({
    description: 'ThingsBoard Device ID',
    type: String,
    example: 'a1b2c3d4e5f6g7h8',
  })
  deviceId: string;

  @ApiProperty({
    description: 'Patient Reference ID',
    type: String,
    example: 'Patient-12345',
  })
  patientRef: string;

  @ApiProperty({
    description: 'Counts of telemetry data points',
    type: Object,
    example: { total: 100, saved: 95, failed: 5 },
  })
  counts: {
    total: number;
    saved: number;
    failed: number;
  };
}
