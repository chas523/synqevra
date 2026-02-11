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

    public static async getNotificationTargets() {
        const { data } = await proxyApi.get(
            "thingsboard/notification/targets"
        );
        return data;
    }
}
