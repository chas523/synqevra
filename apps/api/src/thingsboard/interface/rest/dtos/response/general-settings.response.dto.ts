import { ApiProperty } from '@nestjs/swagger';

export class EntityIdDto {
    @ApiProperty({ example: 'ADMIN_SETTINGS' })
    entityType: string;

    @ApiProperty({ example: '193d2000-b59b-11f0-b700-0d5441179182' })
    id: string;
}

export class TenantIdDto {
    @ApiProperty({ example: 'TENANT' })
    entityType: string;

    @ApiProperty({ example: '13814000-1dd2-11b2-8080-808080808080' })
    id: string;
}

export class GeneralSettingsJsonValueDto {
    @ApiProperty({ example: 'http://localhost:8088' })
    baseUrl: string;

    @ApiProperty({ example: false })
    prohibitDifferentUrl: boolean;
}

export class GeneralSettingsDto {
    @ApiProperty({ type: EntityIdDto })
    id: EntityIdDto;

    @ApiProperty({ example: 1761833819648 })
    createdTime: number;

    @ApiProperty({ type: TenantIdDto })
    tenantId: TenantIdDto;

    @ApiProperty({ example: 'general' })
    key: string;

    @ApiProperty({ type: GeneralSettingsJsonValueDto })
    jsonValue: GeneralSettingsJsonValueDto;
}
