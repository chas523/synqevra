import { ApiProperty } from '@nestjs/swagger';

export class ProtocolConfigDto {
  @ApiProperty({ example: true })
  enabled: boolean;

  @ApiProperty({ example: '' })
  host: string;

  @ApiProperty({ example: '8088' })
  port: string | number;
}

export class ConnectivityJsonValueDto {
  @ApiProperty({ type: ProtocolConfigDto })
  http: ProtocolConfigDto;

  @ApiProperty({ type: ProtocolConfigDto })
  https: ProtocolConfigDto;

  @ApiProperty({ type: ProtocolConfigDto })
  mqtt: ProtocolConfigDto;

  @ApiProperty({ type: ProtocolConfigDto })
  mqtts: ProtocolConfigDto;

  @ApiProperty({ type: ProtocolConfigDto })
  coap: ProtocolConfigDto;

  @ApiProperty({ type: ProtocolConfigDto })
  coaps: ProtocolConfigDto;
}

export class EntityIdDto {
  @ApiProperty({ example: 'ADMIN_SETTINGS' })
  entityType: string;

  @ApiProperty({ example: '19413eb0-b59b-11f0-b700-0d5441179182' })
  id: string;
}

export class TenantIdDto {
  @ApiProperty({ example: 'TENANT' })
  entityType: string;

  @ApiProperty({ example: '13814000-1dd2-11b2-8080-808080808080' })
  id: string;
}

export class ConnectivitySettingsDto {
  @ApiProperty({ type: EntityIdDto })
  id: EntityIdDto;

  @ApiProperty({ example: 1761833819675 })
  createdTime: number;

  @ApiProperty({ type: TenantIdDto })
  tenantId: TenantIdDto;

  @ApiProperty({ example: 'connectivity' })
  key: string;

  @ApiProperty({ type: ConnectivityJsonValueDto })
  jsonValue: ConnectivityJsonValueDto;
}
