import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityIdDto, TenantIdDto } from './general-settings.response.dto';

export class ResourceDto {
  @ApiPropertyOptional({ type: EntityIdDto })
  id?: EntityIdDto;

  @ApiPropertyOptional({ example: 1770633756966 })
  createdTime?: number;

  @ApiPropertyOptional({ type: TenantIdDto })
  tenantId?: TenantIdDto;

  @ApiProperty({ example: 'Interval Data Delivery id=10262 v1.0' })
  title: string;

  @ApiProperty({ example: 'LWM2M_MODEL' })
  resourceType: 'LWM2M_MODEL' | 'PKCS_12' | 'JKS';

  @ApiPropertyOptional({ example: null })
  resourceSubType?: string | null;

  @ApiPropertyOptional({ example: '10262_1.0' })
  resourceKey?: string;

  @ApiPropertyOptional({ example: null })
  publicResourceKey?: string | null;

  @ApiPropertyOptional({ example: 'f523cdfba0af69d58c0ab1cd7' })
  etag?: string;

  @ApiProperty({ example: '10262.xml' })
  fileName: string;

  @ApiPropertyOptional({ example: null })
  descriptor?: any;

  @ApiPropertyOptional({ example: null })
  externalId?: string | null;

  @ApiPropertyOptional({ example: 'Interval Data Delivery id=10262 v1.0' })
  name?: string;

  @ApiPropertyOptional({ example: false })
  public?: boolean;

  @ApiPropertyOptional({
    example: '/api/resource/lwm2m_model/system/10262_1.0',
  })
  link?: string;

  @ApiPropertyOptional({ example: null })
  publicLink?: string | null;

  @ApiPropertyOptional({ example: 'base64-encoded-data' })
  data?: string;
}

export class ResourceCreateDto {
  @ApiProperty({ example: 'My Resource Title' })
  title: string;

  @ApiProperty({ example: 'LWM2M_MODEL' })
  resourceType: 'LWM2M_MODEL' | 'PKCS_12' | 'JKS';

  @ApiProperty({ example: '10262.xml' })
  fileName: string;

  @ApiProperty({ example: 'base64-encoded-data' })
  data: string;
}

export class ResourcesPageResponseDto {
  @ApiProperty({ type: [ResourceDto] })
  data: ResourceDto[];

  @ApiProperty({ example: 31 })
  totalPages: number;

  @ApiProperty({ example: 303 })
  totalElements: number;

  @ApiProperty({ example: true })
  hasNext: boolean;
}
