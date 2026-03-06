import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityIdDto, TenantIdDto } from './general-settings.response.dto';

// SMS Provider Types
export type SmsProviderType = 'AWS_SNS' | 'TWILIO' | 'SMPP';

// AWS SNS Config
export class AwsSnsConfigDto {
  @ApiProperty({ example: 'AKIAIOSFODNN7EXAMPLE' })
  accessKeyId: string;

  @ApiProperty({ example: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' })
  secretAccessKey: string;

  @ApiProperty({ example: 'us-east-1' })
  region: string;

  @ApiProperty({ example: 'AWS_SNS' })
  type: 'AWS_SNS';
}

// Twilio Config
export class TwilioConfigDto {
  @ApiProperty({ example: '+15551234567' })
  numberFrom: string;

  @ApiProperty({ example: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  accountSid: string;

  @ApiProperty({ example: 'your_auth_token' })
  accountToken: string;

  @ApiProperty({ example: 'TWILIO' })
  type: 'TWILIO';
}

// SMPP Config
export class SmppConfigDto {
  @ApiProperty({ example: 3.4 })
  protocolVersion: number;

  @ApiProperty({ example: 'smpp.example.com' })
  host: string;

  @ApiProperty({ example: 2775 })
  port: number;

  @ApiProperty({ example: 'systemId' })
  systemId: string;

  @ApiProperty({ example: 'password' })
  password: string;

  @ApiPropertyOptional({ example: '' })
  systemType?: string;

  @ApiProperty({ example: 'TX', enum: ['TX', 'RX', 'TRX'] })
  bindType: 'TX' | 'RX' | 'TRX';

  @ApiPropertyOptional({ example: '' })
  serviceType?: string;

  @ApiPropertyOptional({ example: '' })
  sourceAddress?: string;

  @ApiProperty({ example: 5 })
  sourceTon: number;

  @ApiProperty({ example: 0 })
  sourceNpi: number;

  @ApiProperty({ example: 5 })
  destinationTon: number;

  @ApiProperty({ example: 0 })
  destinationNpi: number;

  @ApiPropertyOptional({ example: '' })
  addressRange?: string;

  @ApiProperty({ example: 0 })
  codingScheme: number;

  @ApiProperty({ example: 'SMPP' })
  type: 'SMPP';
}

// Union type for SMS config
export type SmsConfigJsonValue =
  | AwsSnsConfigDto
  | TwilioConfigDto
  | SmppConfigDto;

// SMS Settings DTO
export class SmsSettingsDto {
  @ApiProperty({ type: EntityIdDto })
  id: EntityIdDto;

  @ApiProperty({ example: 1770382610933 })
  createdTime: number;

  @ApiProperty({ type: TenantIdDto })
  tenantId: TenantIdDto;

  @ApiProperty({ example: 'sms' })
  key: string;

  @ApiProperty()
  jsonValue: SmsConfigJsonValue;
}
