// Resource types for the frontend

export interface ResourceId {
    entityType: 'TB_RESOURCE';
    id: string;
}

export interface TenantId {
    entityType: 'TENANT';
    id: string;
}

export interface Resource {
    id?: ResourceId;
    createdTime?: number;
    tenantId?: TenantId;
    title: string;
    resourceType: ResourceType;
    resourceSubType?: string | null;
    resourceKey?: string;
    publicResourceKey?: string | null;
    etag?: string;
    fileName: string;
    descriptor?: any;
    externalId?: string | null;
    name?: string;
    public?: boolean;
    link?: string;
    publicLink?: string | null;
    data?: string;
}

export interface ResourceCreateRequest {
    title: string;
    resourceType: ResourceType;
    resourceSubType?: string;
    fileName: string;
    data: string;
}

export interface ResourcesPageResponse {
    data: Resource[];
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}

export type ResourceType = 'LWM2M_MODEL' | 'PKCS_12' | 'JKS' | 'JS_MODULE';
export type ResourceSubType = 'EXTENSION' | 'MODULE';

export interface ResourceTypeOption {
    value: ResourceType;
    label: string;
    acceptedExtensions: string[];
    requiresTitle: boolean;
}

export const RESOURCE_TYPE_OPTIONS: ResourceTypeOption[] = [
    {
        value: 'LWM2M_MODEL',
        label: 'LWM2M model',
        acceptedExtensions: ['.xml'],
        requiresTitle: false,
    },
    {
        value: 'PKCS_12',
        label: 'PKCS #12',
        acceptedExtensions: ['.p12'],
        requiresTitle: true,
    },
    {
        value: 'JKS',
        label: 'JKS',
        acceptedExtensions: ['.jks', '.keystore'],
        requiresTitle: true,
    },
];
