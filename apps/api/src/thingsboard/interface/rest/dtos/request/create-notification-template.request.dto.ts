export class CreateNotificationTemplateRequestDto {
    name: string;
    notificationType: string;
    configuration: {
        deliveryMethodsTemplates: {
            [key: string]: {
                enabled: boolean;
                subject?: string;
                body?: string;
                additionalConfig?: Record<string, any>;
            };
        };
    };
}
