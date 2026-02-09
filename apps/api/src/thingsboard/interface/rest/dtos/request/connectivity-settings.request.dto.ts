import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProtocolConfigRequestDto {
    @ApiProperty({ example: true })
    @IsBoolean()
    enabled: boolean;

    @ApiProperty({ example: '' })
    @IsString()
    host: string;

    @ApiProperty({ example: '8088' })
    @IsOptional()
    port: string | number;
}

export class ConnectivityJsonValueRequestDto {
    @ApiProperty({ type: ProtocolConfigRequestDto })
    @ValidateNested()
    @Type(() => ProtocolConfigRequestDto)
    http: ProtocolConfigRequestDto;

    @ApiProperty({ type: ProtocolConfigRequestDto })
    @ValidateNested()
    @Type(() => ProtocolConfigRequestDto)
    https: ProtocolConfigRequestDto;

    @ApiProperty({ type: ProtocolConfigRequestDto })
    @ValidateNested()
    @Type(() => ProtocolConfigRequestDto)
    mqtt: ProtocolConfigRequestDto;

    @ApiProperty({ type: ProtocolConfigRequestDto })
    @ValidateNested()
    @Type(() => ProtocolConfigRequestDto)
    mqtts: ProtocolConfigRequestDto;

    @ApiProperty({ type: ProtocolConfigRequestDto })
    @ValidateNested()
    @Type(() => ProtocolConfigRequestDto)
    coap: ProtocolConfigRequestDto;

    @ApiProperty({ type: ProtocolConfigRequestDto })
    @ValidateNested()
    @Type(() => ProtocolConfigRequestDto)
    coaps: ProtocolConfigRequestDto;
}

export class EntityIdRequestDto {
    @ApiProperty({ example: 'ADMIN_SETTINGS' })
    @IsString()
    entityType: string;

    @ApiProperty({ example: '19413eb0-b59b-11f0-b700-0d5441179182' })
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

export class ConnectivitySettingsRequestDto {
    @ApiProperty({ type: EntityIdRequestDto })
    @ValidateNested()
    @Type(() => EntityIdRequestDto)
    id: EntityIdRequestDto;

    @ApiProperty({ example: 1761833819675 })
    @IsNumber()
    createdTime: number;

    @ApiProperty({ type: TenantIdRequestDto })
    @ValidateNested()
    @Type(() => TenantIdRequestDto)
    tenantId: TenantIdRequestDto;

    @ApiProperty({ example: 'connectivity' })
    @IsString()
    key: string;

    @ApiProperty({ type: ConnectivityJsonValueRequestDto })
    @ValidateNested()
    @Type(() => ConnectivityJsonValueRequestDto)
    jsonValue: ConnectivityJsonValueRequestDto;
}
