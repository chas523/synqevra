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
