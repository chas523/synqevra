import { proxyApi } from "@/lib/api/api";

export interface OAuth2ClientInfo {
    id: { entityType: string; id: string };
    createdTime: number;
    title: string;
    providerName: string;
    platforms: string[];
    name: string;
}

export interface DomainInfo {
    id: { entityType: string; id: string };
    createdTime: number;
    tenantId: { entityType: string; id: string };
    name: string;
    oauth2Enabled: boolean;
    propagateToEdge: boolean;
    oauth2ClientInfos: OAuth2ClientInfo[];
}

export interface PagedResponse<T> {
    data: T[];
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}

export interface CreateDomainPayload {
    name: string;
    oauth2Enabled: boolean;
    propagateToEdge: boolean;
}

export interface OAuth2ConfigTemplate {
    id: { id: string };
    createdTime: number;
    providerId: string;
    authorizationUri: string;
    accessTokenUri: string;
    scope: string[];
    userInfoUri: string | null;
    userNameAttributeName: string;
    jwkSetUri: string | null;
    clientAuthenticationMethod: string;
    comment: string | null;
    loginButtonIcon: string;
    loginButtonLabel: string;
    helpLink: string | null;
    name: string;
    mapperConfig: any;
}

export class OAuth2Service {
    public static async getDomainInfos(
        page = 0,
        pageSize = 10,
        sortProperty = "createdTime",
        sortOrder = "DESC",
    ): Promise<PagedResponse<DomainInfo>> {
        const url = `thingsboard/oauth2/domain/infos?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`;
        const { data } = await proxyApi.get(url);
        return data;
    }

    public static async getOAuth2ClientInfos(
        page = 0,
        pageSize = 50,
        sortProperty = "title",
        sortOrder = "ASC",
    ): Promise<PagedResponse<OAuth2ClientInfo>> {
        const url = `thingsboard/oauth2/client/infos?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`;
        const { data } = await proxyApi.get(url);
        return data;
    }

    public static async createDomain(
        payload: CreateDomainPayload,
        oauth2ClientIds: string[],
    ): Promise<DomainInfo> {
        const idsParam = oauth2ClientIds.join(",");
        const url = `thingsboard/oauth2/domain?oauth2ClientIds=${idsParam}`;
        const { data } = await proxyApi.post(url, payload);
        return data;
    }

    public static async getDomainById(domainId: string): Promise<DomainInfo> {
        const { data } = await proxyApi.get(`thingsboard/oauth2/domain/info/${domainId}`);
        return data;
    }

    public static async updateDomain(
        domainId: string,
        payload: CreateDomainPayload,
        oauth2ClientIds: string[],
    ): Promise<DomainInfo> {
        const idsParam = oauth2ClientIds.join(",");
        const url = `thingsboard/oauth2/domain/${domainId}?oauth2ClientIds=${idsParam}`;
        const { data } = await proxyApi.post(url, payload);
        return data;
    }

    public static async getOAuth2ConfigTemplates(): Promise<OAuth2ConfigTemplate[]> {
        const { data } = await proxyApi.get(`thingsboard/oauth2/config/template`);
        return data;
    }

    public static async saveOAuth2Client(payload: any): Promise<OAuth2ClientInfo> {
        const { data } = await proxyApi.post(`thingsboard/oauth2/client`, payload);
        return data;
    }

    public static async checkGoogleAuthAvailable(): Promise<{ available: boolean }> {
        const { data } = await proxyApi.get(`auth/google/available`);
        return data;
    }
}
