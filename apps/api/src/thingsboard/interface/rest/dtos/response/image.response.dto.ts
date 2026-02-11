import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ImagePreviewDescriptorDto {
    @ApiProperty({ description: 'Media type of preview' })
    mediaType: string;

    @ApiProperty({ description: 'Preview width in pixels' })
    width: number;

    @ApiProperty({ description: 'Preview height in pixels' })
    height: number;

    @ApiProperty({ description: 'Preview size in bytes' })
    size: number;

    @ApiProperty({ description: 'ETag for caching' })
    etag: string;
}

export class ImageDescriptorDto {
    @ApiProperty({ description: 'Media type (e.g., image/png)' })
    mediaType: string;

    @ApiProperty({ description: 'Image width in pixels' })
    width: number;

    @ApiProperty({ description: 'Image height in pixels' })
    height: number;

    @ApiProperty({ description: 'Image size in bytes' })
    size: number;

    @ApiProperty({ description: 'ETag for caching' })
    etag: string;

    @ApiPropertyOptional({ type: ImagePreviewDescriptorDto })
    previewDescriptor?: ImagePreviewDescriptorDto;
}

export class ImageIdDto {
    @ApiProperty({ description: 'Entity type', example: 'TB_RESOURCE' })
    entityType: string;

    @ApiProperty({ description: 'Image ID' })
    id: string;
}

export class TenantIdDto {
    @ApiProperty({ description: 'Entity type', example: 'TENANT' })
    entityType: string;

    @ApiProperty({ description: 'Tenant ID' })
    id: string;
}

export class ImageDto {
    @ApiProperty({ type: ImageIdDto })
    id: ImageIdDto;

    @ApiProperty({ description: 'Creation timestamp' })
    createdTime: number;

    @ApiProperty({ type: TenantIdDto })
    tenantId: TenantIdDto;

    @ApiProperty({ description: 'Image title' })
    title: string;

    @ApiProperty({ description: 'Resource type', example: 'IMAGE' })
    resourceType: string;

    @ApiProperty({ description: 'Resource sub type', example: 'IMAGE' })
    resourceSubType: string;

    @ApiProperty({ description: 'Resource key' })
    resourceKey: string;

    @ApiPropertyOptional({ description: 'Public resource key' })
    publicResourceKey?: string;

    @ApiProperty({ description: 'ETag' })
    etag: string;

    @ApiProperty({ description: 'File name' })
    fileName: string;

    @ApiProperty({ type: ImageDescriptorDto })
    descriptor: ImageDescriptorDto;

    @ApiPropertyOptional({ description: 'External ID' })
    externalId?: string | null;

    @ApiProperty({ description: 'Image name' })
    name: string;

    @ApiProperty({ description: 'Is public' })
    public: boolean;

    @ApiProperty({ description: 'Internal link to image' })
    link: string;

    @ApiPropertyOptional({ description: 'Public link to image' })
    publicLink?: string | null;
}

export class ImagesPageResponseDto {
    @ApiProperty({ type: [ImageDto] })
    data: ImageDto[];

    @ApiProperty({ description: 'Total number of pages' })
    totalPages: number;

    @ApiProperty({ description: 'Total number of elements' })
    totalElements: number;

    @ApiProperty({ description: 'Has more pages' })
    hasNext: boolean;
}

export class ImageExportDto {
    @ApiProperty({ description: 'Image link' })
    link: string;

    @ApiProperty({ description: 'Image title' })
    title: string;

    @ApiProperty({ description: 'Type', example: 'IMAGE' })
    type: string;

    @ApiProperty({ description: 'Sub type', example: 'IMAGE' })
    subType: string;

    @ApiProperty({ description: 'Resource key' })
    resourceKey: string;

    @ApiProperty({ description: 'File name' })
    fileName: string;

    @ApiPropertyOptional({ description: 'Public resource key' })
    publicResourceKey?: string;

    @ApiProperty({ description: 'Media type' })
    mediaType: string;

    @ApiProperty({ description: 'Base64 encoded image data' })
    data: string;

    @ApiProperty({ description: 'Is public' })
    public: boolean;
}

export class DeleteImageResponseDto {
    @ApiProperty({ description: 'Success status' })
    success: boolean;

    @ApiPropertyOptional({ description: 'References if any' })
    references?: any;
}
