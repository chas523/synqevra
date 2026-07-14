import { ApiProperty } from '@nestjs/swagger';

export class WidgetBundleDto {
  @ApiProperty()
  id: {
    entityType: string;
    id: string;
  };

  @ApiProperty()
  createdTime: number;

  @ApiProperty()
  tenantId: {
    entityType: string;
    id: string;
  };

  @ApiProperty()
  alias: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  scada: boolean;

  @ApiProperty()
  description: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  externalId: {
    entityType: string;
    id: string;
  } | null;

  @ApiProperty()
  version: number;

  @ApiProperty()
  name: string;
}

export class WidgetBundlesPageDto {
  @ApiProperty({ type: [WidgetBundleDto] })
  data: WidgetBundleDto[];

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  totalElements: number;

  @ApiProperty()
  hasNext: boolean;
}
