import { proxyApi } from "@/lib/api/api";
import type {
  CreateWidgetTypeRequest,
  WidgetType,
  WidgetTypesPage,
  WidgetBundlesPage,
  SaveWidgetBundleRequest,
  WidgetBundle,
} from "@/types/widgetTypes";

export class WidgetService {
  public static async getWidgetTypes(
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    tenantOnly: boolean = false,
    fullSearch: boolean = false,
    scadaFirst: boolean = false,
    deprecatedFilter: string = "ALL",
    widgetsBundleId: string = "",
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
      widgetsBundleId,
    });
    const { data } = await proxyApi.get(
      `thingsboard/widgetTypes?${params.toString()}`,
    );
    return data;
  }

  public static async getWidgetBundles(
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = "title",
    sortOrder: "ASC" | "DESC" = "ASC",
    tenantOnly: boolean = false,
    fullSearch: boolean = false,
    scadaFirst: boolean = false,
  ): Promise<WidgetBundlesPage> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortProperty,
      sortOrder,
      tenantOnly: tenantOnly.toString(),
      fullSearch: fullSearch.toString(),
      scadaFirst: scadaFirst.toString(),
    });
    const { data } = await proxyApi.get(
      `thingsboard/widgetsBundles?${params.toString()}`,
    );
    return data;
  }

  public static async saveWidgetType(
    request: any,
    updateExistingByFqn: boolean = false,
  ): Promise<WidgetType> {
    console.log(
      "Outputting WidgetService.saveWidgetType payload:",
      JSON.stringify(request, null, 2),
    );
    const { data } = await proxyApi.post(
      `thingsboard/widgetType?updateExistingByFqn=${updateExistingByFqn}`,
      request,
    );
    return data;
  }

  public static async deleteWidgetType(widgetTypeId: string): Promise<void> {
    await proxyApi.delete(`thingsboard/widgetType/${widgetTypeId}`);
  }

  public static async getWidgetTypeById(
    widgetTypeId: string,
  ): Promise<WidgetType> {
    const { data } = await proxyApi.get(
      `thingsboard/widgetType/${widgetTypeId}`,
    );
    return data;
  }

  public static async getWidgetBundleById(
    widgetBundleId: string,
  ): Promise<WidgetBundle> {
    const { data } = await proxyApi.get(
      `thingsboard/widgetBundle/${widgetBundleId}`,
    );
    return data;
  }

  public static async downloadWidgetType(
    widgetTypeId: string,
    includeResources: boolean = true,
  ): Promise<Blob> {
    const { data } = await proxyApi.get(
      `thingsboard/widgetType/${widgetTypeId}/download?includeResources=${includeResources}`,
      {
        responseType: "blob",
      },
    );
    return data;
  }

  public static async getWidgetsBundles(
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    tenantOnly: boolean = false,
    fullSearch: boolean = false,
    scadaFirst: boolean = false,
    deprecatedFilter: string = "ALL",
  ): Promise<any> {
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
    const { data } = await proxyApi.get(
      `thingsboard/widgetsBundles?${params.toString()}`,
    );
    return data;
  }

  public static async getWidgetTypeFqns(
    widgetsBundleId: string,
  ): Promise<string[]> {
    const { data } = await proxyApi.get(
      `thingsboard/widgetsBundle/${widgetsBundleId}/widgetTypeFqns`,
    );
    return data;
  }

  public static async saveWidgetTypeFqns(
    widgetsBundleId: string,
    fqns: string[],
  ): Promise<any> {
    const { data } = await proxyApi.post(
      `thingsboard/widgetsBundle/${widgetsBundleId}/widgetTypeFqns`,
      fqns,
    );
    return data;
  }

  public static async saveWidgetBundle(
    bundle: SaveWidgetBundleRequest,
  ): Promise<WidgetBundle> {
    const { data } = await proxyApi.post("thingsboard/widgetBundle", bundle);
    return data;
  }

  public static async createWidgetType(
    request: CreateWidgetTypeRequest,
  ): Promise<WidgetType> {
    const { data } = await proxyApi.post("thingsboard/widgetType", request);
    return data;
  }
}
