import { proxyApi } from "@/lib/api/api";
import type {
  Asset,
  AssetProfileInfo,
  AssetProfileInfosResponse,
  AssetsResponse,
  CreateAssetRequest,
  CustomersResponse,
} from "@/types/thingsboardAssetTypes";

export interface AssetLatestTelemetryPoint {
  ts: number;
  value: unknown;
}

export type AssetLatestTelemetryResponse = Record<
  string,
  AssetLatestTelemetryPoint[]
>;

export interface AssetCalculatedField {
  id: { entityType: string; id: string };
  createdTime: number;
  type: string;
  name: string;
  configuration?: {
    expression?: string;
    output?: {
      name?: string;
      type?: string;
      decimalsByDefault?: number;
    };
  };
  version?: number;
}

export interface AssetCalculatedFieldsResponse {
  data: AssetCalculatedField[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface AssetAuditLog {
  id?: { id?: string };
  createdTime: number;
  entityName?: string;
  userName?: string;
  actionType: string;
  actionData?: Record<string, unknown>;
  actionStatus: string;
  actionFailureDetails?: string;
}

export interface AssetAuditLogsResponse {
  data: AssetAuditLog[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface AssetDetails extends Asset {
  additionalInfo?: {
    description?: string;
  };
}

export class AssetService {
  public static async fetchAssets(
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    assetProfileId = "",
  ): Promise<AssetsResponse> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortProperty,
      sortOrder,
      assetProfileId,
    });

    const { data } = await proxyApi.get<AssetsResponse>(
      `/thingsboard/assets?${params.toString()}`,
    );
    return data;
  }

  public static async createAsset(payload: CreateAssetRequest): Promise<Asset> {
    const { data } = await proxyApi.post<Asset>("/thingsboard/assets", payload);
    return data;
  }

  public static async makeAssetPublic(
    id: string,
  ): Promise<Asset | { success: boolean; info?: boolean; message?: string }> {
    const { data } = await proxyApi.post<
      Asset | { success: boolean; info?: boolean; message?: string }
    >(`/thingsboard/assets/${id}/make-public`);
    return data;
  }

  public static async makeAssetPrivate(
    id: string,
  ): Promise<Asset | { success: boolean; info?: boolean; message?: string }> {
    const { data } = await proxyApi.delete<
      Asset | { success: boolean; info?: boolean; message?: string }
    >(`/thingsboard/assets/${id}/make-private`);
    return data;
  }

  public static async deleteAsset(id: string): Promise<void> {
    await proxyApi.delete(`/thingsboard/assets/${id}`);
  }

  public static async fetchAsset(id: string): Promise<AssetDetails> {
    const { data } = await proxyApi.get<AssetDetails>(
      `/thingsboard/assets/${id}`,
    );
    return data;
  }

  public static async updateAsset(
    id: string,
    payload: Partial<AssetDetails>,
  ): Promise<AssetDetails> {
    const { data } = await proxyApi.put<AssetDetails>(
      `/thingsboard/assets/${id}`,
      payload,
    );
    return data;
  }

  public static async fetchAssetSharedAttributes(id: string): Promise<any> {
    const { data } = await proxyApi.get<any>(
      `/thingsboard/assets/${id}/attributes`,
    );
    return data;
  }

  public static async fetchAssetServerAttributes(id: string): Promise<any> {
    const { data } = await proxyApi.get<any>(
      `/thingsboard/assets/${id}/attributes`,
    );
    return data;
  }

  public static async fetchAssetAttributeKeys(id: string): Promise<string[]> {
    const { data } = await proxyApi.get<string[]>(
      `/thingsboard/assets/${id}/attributes/keys`,
    );
    return Array.isArray(data) ? data : [];
  }

  public static async updateAssetSharedAttributes(
    id: string,
    attributes: Record<string, any>,
  ): Promise<void> {
    await proxyApi.post(`/thingsboard/assets/${id}/attributes`, attributes);
  }

  public static async updateAssetServerAttributes(
    id: string,
    attributes: Record<string, any>,
  ): Promise<void> {
    await proxyApi.post(`/thingsboard/assets/${id}/attributes`, attributes);
  }

  public static async addAssetLatestTelemetry(
    id: string,
    telemetry: Record<string, unknown>,
  ): Promise<void> {
    await proxyApi.post(
      `/thingsboard/assets/${id}/telemetry/latest`,
      telemetry,
    );
  }

  public static async fetchAssetLatestTelemetry(
    id: string,
    keys: string[],
  ): Promise<AssetLatestTelemetryResponse> {
    const params = new URLSearchParams();
    if (keys.length > 0) {
      params.append("keys", keys.join(","));
    }

    const { data } = await proxyApi.get<AssetLatestTelemetryResponse>(
      `/thingsboard/assets/${id}/telemetry/latest?${params.toString()}`,
    );
    return data;
  }

  public static async fetchAssetLatestTelemetryKeys(
    id: string,
  ): Promise<string[]> {
    const { data } = await proxyApi.get<string[]>(
      `/thingsboard/assets/${id}/telemetry/latest/keys`,
    );
    return Array.isArray(data) ? data : [];
  }

  public static async fetchAssetCalculatedFields(
    id: string,
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
  ): Promise<AssetCalculatedFieldsResponse> {
    const { data } = await proxyApi.get<AssetCalculatedFieldsResponse>(
      `/thingsboard/assets/${id}/calculated-fields?page=${page}&pageSize=${pageSize}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`,
    );
    return data;
  }

  public static async createAssetCalculatedField(
    id: string,
    payload: {
      title: string;
      fieldType: "simple" | "script";
      expression: string;
      outputKey?: string;
      outputType?: "TIME_SERIES" | "ATTRIBUTES";
      attributeScope?: "SERVER_SCOPE" | "SHARED_SCOPE";
      useLatestTimestamp?: boolean;
      arguments: Array<{
        argumentName: string;
        entityType:
          | "current_entity"
          | "device"
          | "asset"
          | "customer"
          | "current_tenant";
        argumentType: "attribute" | "latest_telemetry";
        timeSeriesKey?: string;
        name?: string;
        defaultValue?: string;
      }>;
      failuresEnabled?: boolean;
      allEnabled?: boolean;
      decimalsByDefault?: number;
    },
  ): Promise<AssetCalculatedField> {
    const { data } = await proxyApi.post<AssetCalculatedField>(
      `/thingsboard/assets/${id}/calculated-fields`,
      payload,
    );
    return data;
  }

  public static async getAssetAlarms(
    assetId: string,
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
      `/thingsboard/assets/${assetId}/alarms?${params.toString()}`,
    );
    return data;
  }

  public static async getAssetEvents(
    assetId: string,
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
      `/thingsboard/assets/${assetId}/events?${params.toString()}`,
    );
    return data;
  }

  public static async getAssetAuditLogs(
    assetId: string,
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    startTime?: number,
    endTime?: number,
  ): Promise<AssetAuditLogsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortProperty,
      sortOrder,
    });

    if (startTime) params.append("startTime", startTime.toString());
    if (endTime) params.append("endTime", endTime.toString());

    const { data } = await proxyApi.get<AssetAuditLogsResponse>(
      `/thingsboard/assets/${assetId}/audit-logs?${params.toString()}`,
    );
    return data;
  }

  public static async getAssetRelations(
    assetId: string,
    direction: "FROM" | "TO" = "FROM",
  ): Promise<any[]> {
    const { data } = await proxyApi.get<any[]>(
      `/thingsboard/assets/${assetId}/relations?direction=${direction}`,
    );
    return data;
  }

  public static async saveAssetRelation(
    assetId: string,
    params: {
      relatedEntityId: string;
      relatedEntityType: string;
      relationType: string;
      direction: "FROM" | "TO";
    },
  ): Promise<void> {
    await proxyApi.post(`/thingsboard/assets/${assetId}/relations`, params);
  }

  public static async deleteAssetRelation(
    assetId: string,
    params: {
      relatedEntityId: string;
      relatedEntityType: string;
      relationType: string;
      direction: "FROM" | "TO";
    },
  ): Promise<void> {
    await proxyApi.delete(`/thingsboard/assets/${assetId}/relations`, {
      params,
    });
  }

  public static async getAssetProfileInfoByName(
    name: string,
  ): Promise<AssetProfileInfo> {
    const { data } = await proxyApi.get<AssetProfileInfo>(
      `/thingsboard/asset-profile-info/${encodeURIComponent(name)}`,
    );
    return data;
  }

  public static async getAssetProfileInfos(
    page = 0,
    pageSize = 10,
    sortProperty = "name",
    sortOrder: "ASC" | "DESC" = "ASC",
    textSearch?: string,
  ): Promise<AssetProfileInfosResponse> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortProperty,
      sortOrder,
    });

    if (textSearch?.trim()) {
      params.append("textSearch", textSearch.trim());
    }

    const { data } = await proxyApi.get<AssetProfileInfosResponse>(
      `/thingsboard/asset-profile-infos?${params.toString()}`,
    );
    return data;
  }

  public static async getCustomers(
    page = 0,
    pageSize = 50,
    sortProperty = "title",
    sortOrder: "ASC" | "DESC" = "ASC",
    textSearch?: string,
  ): Promise<CustomersResponse> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortProperty,
      sortOrder,
    });

    if (textSearch?.trim()) {
      params.append("textSearch", textSearch.trim());
    }

    const { data } = await proxyApi.get<CustomersResponse>(
      `/thingsboard/customers?${params.toString()}`,
    );
    return data;
  }
}
