export interface WidgetType {
    id: {
        id: string;
        entityType: string;
    };
    createdTime: number;
    tenantId: {
        id: string;
        entityType: string;
    };
    bundles: {
        id: {
            id: string;
            entityType: string;
        };
        name: string;
    }[];
    alias: string;
    name: string;
    descriptor: any;
    image: string;
    description: string;
    tags: string[];
    scada: boolean;
    deprecated: boolean;
}

export interface WidgetTypesPage {
    data: WidgetType[];
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}

export interface CreateWidgetTypeRequest {
    bundleAlias: string;
    alias: string;
    name: string;
    descriptor: any;
    image?: string;
    description?: string;
    tags?: string[];
    scada?: boolean;
}

export interface WidgetBundle {
    id: {
        entityType: string;
        id: string;
    };
    createdTime: number;
    tenantId: {
        entityType: string;
        id: string;
    };
    alias: string;
    title: string;
    image: string;
    scada: boolean;
    description: string;
    order: number;
    externalId: {
        entityType: string;
        id: string;
    } | null;
    version: number;
    name: string;
}

export interface WidgetBundlesPage {
    data: WidgetBundle[];
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}

export interface SaveWidgetBundleRequest {
    title: string;
    alias?: string;
    image?: string; // Image link or base64? Usually link or public resource key
    description?: string;
    scada?: boolean;
    order?: number;
}
