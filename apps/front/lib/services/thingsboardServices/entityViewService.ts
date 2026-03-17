import { proxyApi } from "@/lib/api/api";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import type {
  CreateEntityViewRequest,
  EntityView,
  EntityViewSourceOption,
  EntityViewTypeOption,
  EntityViewsResponse,
} from "@/types/thingsboardEntityViewTypes";

export interface EntityViewLatestTelemetryPoint {
  ts: number;
  value: unknown;
}

export type EntityViewLatestTelemetryResponse = Record<
  string,
  EntityViewLatestTelemetryPoint[]
>;

export interface EntityViewAuditLog {
  id?: { id?: string };
  createdTime: number;
  entityName?: string;
  userName?: string;
  actionType: string;
  actionData?: Record<string, unknown>;
  actionStatus: string;
  actionFailureDetails?: string;
}

export interface EntityViewAuditLogsResponse {
  data: EntityViewAuditLog[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export class EntityViewService {
  public static async fetchEntityViews(
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    type = "",
  ): Promise<EntityViewsResponse> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortProperty,
      sortOrder,
      type,
    });

    const { data } = await proxyApi.get<EntityViewsResponse>(
      `/thingsboard/entity-views?${params.toString()}`,
    );
    return data;
  }

  public static async createEntityView(
    payload: CreateEntityViewRequest,
  ): Promise<EntityView> {
    const { data } = await proxyApi.post<EntityView>(
      "/thingsboard/entity-views",
      payload,
    );
    return data;
  }

  public static async fetchEntityView(id: string): Promise<EntityView> {
    const { data } = await proxyApi.get<EntityView>(
      `/thingsboard/entity-views/${id}`,
    );
    return data;
  }

  public static async updateEntityView(
    id: string,
    payload: Partial<EntityView>,
  ): Promise<EntityView> {
    const { data } = await proxyApi.put<EntityView>(
      `/thingsboard/entity-views/${id}`,
      payload,
    );
    return data;
  }

  public static async fetchEntityViewTypes(): Promise<EntityViewTypeOption[]> {
    const { data } = await proxyApi.get<EntityViewTypeOption[]>(
      "/thingsboard/entity-views/types",
    );
    return Array.isArray(data) ? data : [];
  }

  public static async fetchEntityViewSourceOptions(
    entityType: "DEVICE" | "ASSET",
  ): Promise<EntityViewSourceOption[]> {
    if (entityType === "ASSET") {
      const response = await AssetService.fetchAssets(0, 50, "name", "ASC", "");

      return response.data.map((asset) => ({
        id: asset.id?.id ?? "",
        name: asset.name,
      }));
    }

    const response = await DeviceService.fetchDevices(0, 50, "name", "ASC");
    return response.data.map((device) => ({
      id: device.id?.id ?? "",
      name: device.name,
    }));
  }

  public static async fetchEntityViewServerAttributes(
    id: string,
  ): Promise<any> {
    const { data } = await proxyApi.get<any>(
      `/thingsboard/entity-views/${id}/attributes?scope=SERVER_SCOPE`,
    );
    return data;
  }

  public static async fetchEntityViewSharedAttributes(
    id: string,
  ): Promise<any> {
    const { data } = await proxyApi.get<any>(
      `/thingsboard/entity-views/${id}/attributes?scope=SHARED_SCOPE`,
    );
    return data;
  }

  public static async fetchEntityViewClientAttributes(
    id: string,
  ): Promise<any> {
    const { data } = await proxyApi.get<any>(
      `/thingsboard/entity-views/${id}/attributes?scope=CLIENT_SCOPE`,
    );
    return data;
  }

  public static async updateEntityViewServerAttributes(
    id: string,
    attributes: Record<string, any>,
  ): Promise<void> {
    await proxyApi.post(
      `/thingsboard/entity-views/${id}/attributes?scope=SERVER_SCOPE`,
      attributes,
    );
  }

  public static async updateEntityViewSharedAttributes(
    id: string,
    attributes: Record<string, any>,
  ): Promise<void> {
    await proxyApi.post(
      `/thingsboard/entity-views/${id}/attributes?scope=SHARED_SCOPE`,
      attributes,
    );
  }

  public static async fetchEntityViewLatestTelemetry(
    id: string,
    keys: string[],
  ): Promise<EntityViewLatestTelemetryResponse> {
    const params = new URLSearchParams();
    if (keys.length > 0) {
      params.append("keys", keys.join(","));
    }

    const { data } = await proxyApi.get<EntityViewLatestTelemetryResponse>(
      `/thingsboard/entity-views/${id}/telemetry/latest?${params.toString()}`,
    );
    return data;
  }

  public static async fetchEntityViewLatestTelemetryKeys(
    id: string,
  ): Promise<string[]> {
    const { data } = await proxyApi.get<string[]>(
      `/thingsboard/entity-views/${id}/telemetry/latest/keys`,
    );
    return Array.isArray(data) ? data : [];
  }

  public static async getEntityViewAlarms(
    entityViewId: string,
    page = 0,
    pageSize = 10,
    statusList?: string[],
    severityList?: string[],
    startTime?: number,
    endTime?: number,
  ): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (statusList?.length) params.append("statusList", statusList.join(","));
    if (severityList?.length)
      params.append("severityList", severityList.join(","));
    if (startTime) params.append("startTime", startTime.toString());
    if (endTime) params.append("endTime", endTime.toString());

    const { data } = await proxyApi.get<any>(
      `/thingsboard/entity-views/${entityViewId}/alarms?${params.toString()}`,
    );
    return data;
  }

  public static async getEntityViewEvents(
    entityViewId: string,
    page = 0,
    pageSize = 10,
    eventType?: string,
    startTime?: number,
    endTime?: number,
  ): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (eventType) params.append("eventType", eventType);
    if (startTime) params.append("startTime", startTime.toString());
    if (endTime) params.append("endTime", endTime.toString());

    const { data } = await proxyApi.get<any>(
      `/thingsboard/entity-views/${entityViewId}/events?${params.toString()}`,
    );
    return data;
  }

  public static async getEntityViewAuditLogs(
    entityViewId: string,
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    startTime?: number,
    endTime?: number,
  ): Promise<EntityViewAuditLogsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortProperty,
      sortOrder,
    });

    if (startTime) params.append("startTime", startTime.toString());
    if (endTime) params.append("endTime", endTime.toString());

    const { data } = await proxyApi.get<EntityViewAuditLogsResponse>(
      `/thingsboard/entity-views/${entityViewId}/audit-logs?${params.toString()}`,
    );
    return data;
  }

  public static async getEntityViewRelations(
    entityViewId: string,
    direction: "FROM" | "TO" = "FROM",
  ): Promise<any[]> {
    const { data } = await proxyApi.get<any[]>(
      `/thingsboard/entity-views/${entityViewId}/relations?direction=${direction}`,
    );
    return data;
  }

  public static async saveEntityViewRelation(
    entityViewId: string,
    params: {
      relatedEntityId: string;
      relatedEntityType: string;
      relationType: string;
      direction: "FROM" | "TO";
    },
  ): Promise<void> {
    await proxyApi.post(
      `/thingsboard/entity-views/${entityViewId}/relations`,
      params,
    );
  }

  public static async deleteEntityViewRelation(
    entityViewId: string,
    params: {
      relatedEntityId: string;
      relatedEntityType: string;
      relationType: string;
      direction: "FROM" | "TO";
    },
  ): Promise<void> {
    await proxyApi.delete(
      `/thingsboard/entity-views/${entityViewId}/relations`,
      { params },
    );
  }

  public static async makeEntityViewPublic(
    id: string,
  ): Promise<
    EntityView | { success: boolean; info?: boolean; message?: string }
  > {
    const { data } = await proxyApi.post<
      EntityView | { success: boolean; info?: boolean; message?: string }
    >(`/thingsboard/entity-views/${id}/make-public`);
    return data;
  }

  public static async makeEntityViewPrivate(
    id: string,
  ): Promise<
    EntityView | { success: boolean; info?: boolean; message?: string }
  > {
    const { data } = await proxyApi.delete<
      EntityView | { success: boolean; info?: boolean; message?: string }
    >(`/thingsboard/entity-views/${id}/make-private`);
    return data;
  }

  public static async deleteEntityView(id: string): Promise<void> {
    await proxyApi.delete(`/thingsboard/entity-views/${id}`);
  }
}
