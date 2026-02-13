import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityIdDto, TenantIdDto } from './general-settings.response.dto';

export class MailConfigDto {
    @ApiProperty()
    mailFrom: string;

    @ApiProperty()
    smtpProtocol: string;

    @ApiProperty()
    smtpHost: string;

    @ApiProperty()
    smtpPort: number;

    @ApiPropertyOptional()
    timeout?: number;

    @ApiProperty()
    enableTls: boolean;

    @ApiPropertyOptional()
    tlsVersion?: string;

    @ApiPropertyOptional()
    username?: string;

    @ApiPropertyOptional()
    password?: string;

    @ApiProperty()
    enableProxy: boolean;

    @ApiPropertyOptional()
    proxyHost?: string;

    @ApiPropertyOptional()
    proxyPort?: number;

    @ApiPropertyOptional()
    proxyUser?: string;

    @ApiPropertyOptional()
    proxyPassword?: string;

    @ApiProperty()
    providerId: string;

    @ApiProperty()
    enableOauth2: boolean;

    @ApiPropertyOptional()
    clientId?: string;

    @ApiPropertyOptional()
    clientSecret?: string;

    @ApiPropertyOptional()
    providerTenantId?: string;

    @ApiPropertyOptional()
    authUri?: string;

    @ApiPropertyOptional()
    tokenUri?: string;

    @ApiPropertyOptional()
    scope?: string[];

    @ApiPropertyOptional()
    redirectUri?: string;

    @ApiPropertyOptional()
    redirectUriProtocol?: string;

    @ApiPropertyOptional()
    redirectUriDomain?: string;
}

export class MailSettingsDto {
    @ApiProperty({ type: EntityIdDto })
    id: EntityIdDto;

    @ApiProperty()
    createdTime: number;

    @ApiProperty({ type: TenantIdDto })
    tenantId: TenantIdDto;

    @ApiProperty({ example: 'mail' })
    key: string;

    @ApiProperty({ type: MailConfigDto })
    jsonValue: MailConfigDto;
}
