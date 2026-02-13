import { proxyApi } from "@/lib/api/api";
import { CreateWidgetTypeRequest, WidgetType, WidgetTypesPage } from "@/types/widgetTypes";

export class WidgetService {
    public static async getWidgetTypes(
        page: number = 0,
        pageSize: number = 10,
        sortProperty: string = 'createdTime',
        sortOrder: 'ASC' | 'DESC' = 'DESC',
        tenantOnly: boolean = false,
        fullSearch: boolean = false,
        scadaFirst: boolean = false,
        deprecatedFilter: string = 'ALL'
    ): Promise<WidgetTypesPage> {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
            sortProperty,
            sortOrder,
            tenantOnly: tenantOnly.toString(),
            fullSearch: fullSearch.toString(),
            scadaFirst: scadaFirst.toString(),
            deprecatedFilter,
        });
        const { data } = await proxyApi.get(`thingsboard/widgetTypes?${params.toString()}`);
        return data;
    }

    public static async saveWidgetType(request: any, updateExistingByFqn: boolean = false): Promise<WidgetType> {
        const { data } = await proxyApi.post(`thingsboard/widgetType?updateExistingByFqn=${updateExistingByFqn}`, request);
        return data;
    }

    public static async deleteWidgetType(widgetTypeId: string): Promise<void> {
        await proxyApi.delete(`thingsboard/widgetType/${widgetTypeId}`);
    }

    public static async getWidgetTypeById(widgetTypeId: string): Promise<WidgetType> {
        const { data } = await proxyApi.get(`thingsboard/widgetType/${widgetTypeId}`);
        return data;
    }

    public static async downloadWidgetType(widgetTypeId: string, includeResources: boolean = true): Promise<Blob> {
        const { data } = await proxyApi.get(`thingsboard/widgetType/${widgetTypeId}/download?includeResources=${includeResources}`, {
            responseType: 'blob',
        });
        return data;
    }
}
