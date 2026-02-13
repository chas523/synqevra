export interface NotificationTemplateDto {
    id: {
        entityType: string;
        id: string;
    };
    createdTime: number;
    name: string;
    notificationType: string;
    configuration: {
        deliveryMethodsTemplates: Record<string, {
            method: string;
            enabled: boolean;
            body?: string;
            subject?: string;
            additionalConfig?: Record<string, any>;
        }>;
    };
}

export interface NotificationTemplatesResponse {
    templates: NotificationTemplateDto[];
    totalElements: number;
    totalPages: number;
}
