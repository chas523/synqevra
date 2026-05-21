import { IsObject, IsOptional, IsString } from 'class-validator';

export class AbnormalEventDto {
  @IsString()
  @IsOptional()
  eventId: string;

  @IsString()
  tenantId: string;

  @IsString()
  deviceId: string;

  @IsString()
  @IsOptional()
  alarmType: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  thresholdSnapshot?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  ts?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
