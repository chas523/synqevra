export interface NotificationRuleDto {
    id: {
        entityType: string;
        id: string;
    };
    createdTime: number;
    name: string;
    enabled: boolean;
    templateName?: string;
    triggerType: string;
    triggerConfig: Record<string, any>;
    recipientsConfig: {
        targets: string[];
        triggerType?: string;
    };
    additionalConfig?: {
        description?: string;
    };
    deliveryMethods?: string[];
}

export interface NotificationRulesResponse {
    data: NotificationRuleDto[];
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
}
