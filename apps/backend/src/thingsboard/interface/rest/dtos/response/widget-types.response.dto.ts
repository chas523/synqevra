import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityIdDto, TenantIdDto } from './general-settings.response.dto';

export class WidgetBundleRefDto {
  @ApiProperty({ type: EntityIdDto })
  id: EntityIdDto;

  @ApiProperty()
  name: string;
}

export class WidgetTypeDto {
  @ApiProperty({ type: EntityIdDto })
  id: EntityIdDto;

  @ApiProperty()
  createdTime: number;

  @ApiProperty({ type: TenantIdDto })
  tenantId: TenantIdDto;

  @ApiProperty()
  fqn: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  deprecated: boolean;

  @ApiProperty()
  scada: boolean;

  @ApiProperty()
  version: number;

  @ApiPropertyOptional()
  image?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  widgetType: string;

  @ApiProperty({ type: [WidgetBundleRefDto] })
  bundles: WidgetBundleRefDto[];
}

export class WidgetTypesPageDto {
  @ApiProperty({ type: [WidgetTypeDto] })
  data: WidgetTypeDto[];

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  totalElements: number;

  @ApiProperty()
  hasNext: boolean;
}

export class CreateWidgetTypeRequestDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  bundleAlias: string;

  @ApiProperty()
  descriptor: any; // JSON descriptor
}
