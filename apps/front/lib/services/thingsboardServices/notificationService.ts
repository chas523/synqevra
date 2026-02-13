import { proxyApi } from "@/lib/api/api";

export interface DeliveryMethod {
    method: string;
    name: string;
    enabled: boolean;
}

export interface DeliveryMethodsResponse {
    deliveryMethods: DeliveryMethod[];
}

export interface SendNotificationRequest {
    targets: string[];
    templateId?: {
        entityType: string;
        id: string;
    };
    template?: {
        name?: string;
        notificationType?: string;
        configuration?: {
            deliveryMethodsTemplates?: {
                [key: string]: {
                    enabled: boolean;
                    subject?: string;
                    body?: string;
                    additionalConfig?: Record<string, any>;
                    method?: string;
                };
            };
        };
        // Legacy format support
        deliveryMethodsTemplates?: {
            [key: string]: {
                enabled: boolean;
                subject?: string;
                body?: string;
                additionalConfig?: Record<string, any>;
            };
        };
    };
    additionalConfig?: Record<string, any>;
}

export interface NotificationRequestResponse {
    id: {
        entityType: string;
        id: string;
    };
    createdTime: number;
    status: string;
    targets: string[];
    template?: Record<string, any>;
}

export class NotificationService {
    public static async getDeliveryMethods(): Promise<DeliveryMethodsResponse> {
        const { data } = await proxyApi.get(
            "thingsboard/notification/deliveryMethods"
        );
        return data;
    }

    public static async sendNotification(
        request: SendNotificationRequest
    ): Promise<NotificationRequestResponse> {
        const { data } = await proxyApi.post(
            "thingsboard/notification/send",
            request
        );
        return data;
    }

    public static async createNotificationTarget(request: {
        name: string;
        configuration: {
            type: string;
            usersFilter: {
                type: string;
                tenantsIds?: string[];
                tenantProfilesIds?: string[];
            };
            description?: string | null;
        };
    }) {
        const { data } = await proxyApi.post(
            "thingsboard/notification/target",
            request
        );
        return data;
    }

    public static async createNotificationTemplate(request: {
        name: string;
        notificationType: string;
        configuration: {
            deliveryMethodsTemplates: Record<string, {
                enabled: boolean;
                subject?: string;
                body?: string;
                additionalConfig?: Record<string, any>;
            }>;
        };
    }) {
        const { data } = await proxyApi.post(
            "thingsboard/notification/template",
            request
        );
        return data;
    }

    public static async getNotificationRequests(options: {
        pageSize?: number;
        page?: number;
        sortProperty?: string;
        sortOrder?: string;
    }) {
        const params = new URLSearchParams();
        if (options.pageSize) params.append("pageSize", options.pageSize.toString());
        if (options.page !== undefined) params.append("page", options.page.toString());
        if (options.sortProperty) params.append("sortProperty", options.sortProperty);
        if (options.sortOrder) params.append("sortOrder", options.sortOrder);

        const { data } = await proxyApi.get(
            `thingsboard/notification/requests?${params.toString()}`
        );
        return data;
    }


    public static async getNotificationTargets(options: {
        pageSize?: number;
        page?: number;
        sortProperty?: string;
        sortOrder?: string;
    } = {}) {
        const params = new URLSearchParams();
        if (options.pageSize) params.append("pageSize", options.pageSize.toString());
        if (options.page !== undefined) params.append("page", options.page.toString());
        if (options.sortProperty) params.append("sortProperty", options.sortProperty);
        if (options.sortOrder) params.append("sortOrder", options.sortOrder);

        const { data } = await proxyApi.get(
            `thingsboard/notification/targets?${params.toString()}`
        );
        return data;
    }

    public static async getNotificationTemplates(options: {
        pageSize?: number;
        page?: number;
        sortProperty?: string;
        sortOrder?: string;
        notificationTypes?: string;
    }) {
        const params = new URLSearchParams();
        if (options.pageSize) params.append("pageSize", options.pageSize.toString());
        if (options.page !== undefined) params.append("page", options.page.toString());
        if (options.sortProperty) params.append("sortProperty", options.sortProperty);
        if (options.sortOrder) params.append("sortOrder", options.sortOrder);
        if (options.notificationTypes) params.append("notificationTypes", options.notificationTypes);

        const { data } = await proxyApi.get(
            `thingsboard/notification/templates?${params.toString()}`
        );
        return data;
    }

    public static async getNotificationRules(options: {
        pageSize?: number;
        page?: number;
        sortProperty?: string;
        sortOrder?: string;
    }) {
        const params = new URLSearchParams();
        if (options.pageSize) params.append("pageSize", options.pageSize.toString());
        if (options.page !== undefined) params.append("page", options.page.toString());
        if (options.sortProperty) params.append("sortProperty", options.sortProperty);
        if (options.sortOrder) params.append("sortOrder", options.sortOrder);

        const { data } = await proxyApi.get(
            `thingsboard/notification/rules?${params.toString()}`
        );
        return data;
    }

    public static async previewNotification(request: SendNotificationRequest) {
        const { data } = await proxyApi.post(
            "thingsboard/notification/request/preview",
            request
        );
        return data;
    }

    public static async createNotificationRule(request: {
        name: string;
        enabled: boolean;
        templateId?: {
            entityType: string;
            id: string;
        };
        triggerType: string;
        triggerConfig: Record<string, any>;
        recipientsConfig: {
            targets: string[];
            triggerType: string;
        };
        additionalConfig?: {
            description?: string;
        };
    }) {
        const { data } = await proxyApi.post(
            "thingsboard/notification/rule",
            request
        );
        return data;
    }
}
