export interface MailConfig {
    mailFrom: string;
    smtpProtocol: string;
    smtpHost: string;
    smtpPort: number;
    timeout?: number;
    enableTls: boolean;
    tlsVersion?: string;
    username?: string;
    password?: string;
    enableProxy: boolean;
    proxyHost?: string;
    proxyPort?: number;
    proxyUser?: string;
    proxyPassword?: string;
    providerId: string;
    enableOauth2: boolean;
    clientId?: string;
    clientSecret?: string;
    providerTenantId?: string;
    authUri?: string;
    tokenUri?: string;
    scope?: string[];
    redirectUri?: string;
    redirectUriProtocol?: 'HTTP' | 'HTTPS';
    redirectUriDomain?: string;
}

export interface MailSettings {
    id: {
        id: string;
        entityType: string;
    };
    createdTime: number;
    tenantId: {
        id: string;
        entityType: string;
    };
    key: string;
    jsonValue: MailConfig;
}
