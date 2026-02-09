import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class EntityIdRequestDto {
    @ApiProperty({ example: 'ADMIN_SETTINGS' })
    @IsString()
    entityType: string;

    @ApiProperty({ example: '193d2000-b59b-11f0-b700-0d5441179182' })
    @IsString()
    id: string;
}

export class TenantIdRequestDto {
    @ApiProperty({ example: 'TENANT' })
    @IsString()
    entityType: string;

    @ApiProperty({ example: '13814000-1dd2-11b2-8080-808080808080' })
    @IsString()
    id: string;
}

export class GeneralSettingsJsonValueRequestDto {
    @ApiProperty({ example: 'http://localhost:8088' })
    @IsString()
    @IsNotEmpty()
    baseUrl: string;

    @ApiProperty({ example: false })
    @IsBoolean()
    prohibitDifferentUrl: boolean;
}

export class GeneralSettingsRequestDto {
    @ApiProperty({ type: EntityIdRequestDto })
    @ValidateNested()
    @Type(() => EntityIdRequestDto)
    id: EntityIdRequestDto;

    @ApiProperty({ example: 1761833819648 })
    @IsNumber()
    createdTime: number;

    @ApiProperty({ type: TenantIdRequestDto })
    @ValidateNested()
    @Type(() => TenantIdRequestDto)
    tenantId: TenantIdRequestDto;

    @ApiProperty({ example: 'general' })
    @IsString()
    key: string;

    @ApiProperty({ type: GeneralSettingsJsonValueRequestDto })
    @ValidateNested()
    @Type(() => GeneralSettingsJsonValueRequestDto)
    jsonValue: GeneralSettingsJsonValueRequestDto;
}
