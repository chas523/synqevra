import { proxyApi } from "@/lib/api/api";
import type {
  CreateDeviceRequest,
  Device,
  DeviceAttributes,
  DeviceDetails,
} from "@/types/thingsboardDeviceTypes";

export interface DevicesResponse {
  data: Device[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface DeviceLatestTelemetryPoint {
  ts: number;
  value: unknown;
}

export type DeviceLatestTelemetryResponse = Record<
  string,
  DeviceLatestTelemetryPoint[]
>;

export interface DeviceCalculatedField {
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

export interface DeviceCalculatedFieldsResponse {
  data: DeviceCalculatedField[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface DeviceAuditLog {
  id?: { id?: string };
  createdTime: number;
  entityName?: string;
  userName?: string;
  actionType: string;
  actionData?: Record<string, unknown>;
  actionStatus: string;
  actionFailureDetails?: string;
}

export interface DeviceAuditLogsResponse {
  data: DeviceAuditLog[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface DeviceProfileInfo {
  id: { id: string; entityType: string };
  name: string;
  type?: string;
}

export interface OtaPackageInfo {
  id: { id: string; entityType: string };
  title?: string;
  version?: string;
  type?: string;
}

export interface PagedThingsboardResponse<T> {
  data: T[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export class DeviceService {
  public static async fetchDevices(
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
  ): Promise<DevicesResponse> {
    const { data } = await proxyApi.get(
      `/thingsboard/devices?page=${page}&pageSize=${pageSize}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`,
    );
    return data;
  }

  public static async fetchDevice(id: string): Promise<DeviceDetails> {
    const { data } = await proxyApi.get<DeviceDetails>(
      `/thingsboard/devices/${id}`,
    );
    return data;
  }

  public static async updateDevice(
    id: string,
    payload: Partial<DeviceDetails>,
  ): Promise<DeviceDetails> {
    const { data } = await proxyApi.put<DeviceDetails>(
      `/thingsboard/devices/${id}`,
      payload,
    );
    return data;
  }

  public static async createDevice(
    payload: CreateDeviceRequest,
  ): Promise<Device> {
    const { data } = await proxyApi.post<Device>(
      "/thingsboard/devices",
      payload,
    );
    return data;
  }

  public static async fetchDeviceSharedAttributes(
    id: string,
  ): Promise<DeviceAttributes> {
    const { data } = await proxyApi.get<DeviceAttributes>(
      `/thingsboard/devices/${id}/attributes`,
    );
    return data;
  }

  public static async fetchDeviceAttributeKeys(id: string): Promise<string[]> {
    const { data } = await proxyApi.get<string[]>(
      `/thingsboard/devices/${id}/attributes/keys`,
    );
    return Array.isArray(data) ? data : [];
  }

  public static async updateDeviceSharedAttributes(
    id: string,
    attributes: Record<string, any>,
  ): Promise<void> {
    await proxyApi.put<any>(
      `/thingsboard/devices/${id}/attributes`,
      attributes,
    );
  }

  public static async addDeviceLatestTelemetry(
    id: string,
    telemetry: Record<string, unknown>,
  ): Promise<void> {
    await proxyApi.post(
      `/thingsboard/devices/${id}/telemetry/latest`,
      telemetry,
    );
  }

  public static async fetchDeviceLatestTelemetry(
    id: string,
    keys: string[],
  ): Promise<DeviceLatestTelemetryResponse> {
    const params = new URLSearchParams();
    if (keys.length > 0) {
      params.append("keys", keys.join(","));
    }

    const { data } = await proxyApi.get<DeviceLatestTelemetryResponse>(
      `/thingsboard/devices/${id}/telemetry/latest?${params.toString()}`,
    );
    return data;
  }

  public static async fetchDeviceLatestTelemetryKeys(
    id: string,
  ): Promise<string[]> {
    const { data } = await proxyApi.get<string[]>(
      `/thingsboard/devices/${id}/telemetry/latest/keys`,
    );
    return Array.isArray(data) ? data : [];
  }

  public static async fetchDeviceCalculatedFields(
    id: string,
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
  ): Promise<DeviceCalculatedFieldsResponse> {
    const { data } = await proxyApi.get<DeviceCalculatedFieldsResponse>(
      `/thingsboard/devices/${id}/calculated-fields?page=${page}&pageSize=${pageSize}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`,
    );
    return data;
  }

  public static async createDeviceCalculatedField(
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
  ): Promise<DeviceCalculatedField> {
    const { data } = await proxyApi.post<DeviceCalculatedField>(
      `/thingsboard/devices/${id}/calculated-fields`,
      payload,
    );
    return data;
  }

  public static async deleteDevice(id: string): Promise<void> {
    await proxyApi.delete(`/thingsboard/devices/${id}`);
  }

  public static async makeDevicePublic(id: string): Promise<any> {
    const { data } = await proxyApi.post<any>(
      `/thingsboard/devices/${id}/make-public`,
    );
    return data;
  }

  public static async makeDevicePrivate(id: string): Promise<any> {
    const { data } = await proxyApi.delete<any>(
      `/thingsboard/devices/${id}/make-private`,
    );
    return data;
  }

  public static async getDeviceCredentials(deviceId: string): Promise<any> {
    const { data } = await proxyApi.get<any>(
      `/thingsboard/devices/${deviceId}/credentials`,
    );
    return data;
  }

  public static async saveDeviceCredentials(credentials: any): Promise<any> {
    const { data } = await proxyApi.post<any>(
      `/thingsboard/devices/credentials`,
      credentials,
    );
    return data;
  }

  public static async getDeviceAlarms(
    deviceId: string,
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
      `/thingsboard/devices/${deviceId}/alarms?${params.toString()}`,
    );
    return data;
  }

  public static async getDeviceEvents(
    deviceId: string,
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
      `/thingsboard/devices/${deviceId}/events?${params.toString()}`,
    );
    return data;
  }

  public static async getDeviceAuditLogs(
    deviceId: string,
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    startTime?: number,
    endTime?: number,
  ): Promise<DeviceAuditLogsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortProperty,
      sortOrder,
    });

    if (startTime) params.append("startTime", startTime.toString());
    if (endTime) params.append("endTime", endTime.toString());

    const { data } = await proxyApi.get<DeviceAuditLogsResponse>(
      `/thingsboard/devices/${deviceId}/audit-logs?${params.toString()}`,
    );
    return data;
  }

  public static async getDeviceRelations(
    deviceId: string,
    direction: "FROM" | "TO" = "FROM",
  ): Promise<any[]> {
    const { data } = await proxyApi.get<any[]>(
      `/thingsboard/devices/${deviceId}/relations?direction=${direction}`,
    );
    return data;
  }

  public static async getDeviceProfileInfos(
    page = 0,
    pageSize = 100,
    sortProperty = "name",
    sortOrder: "ASC" | "DESC" = "ASC",
    textSearch?: string,
  ): Promise<PagedThingsboardResponse<DeviceProfileInfo>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortProperty,
      sortOrder,
    });

    if (textSearch?.trim()) {
      params.append("textSearch", textSearch.trim());
    }

    const { data } = await proxyApi.get<
      PagedThingsboardResponse<DeviceProfileInfo>
    >(`/thingsboard/device-profile-infos?${params.toString()}`);
    return data;
  }

  public static async getOtaPackages(
    type: "FIRMWARE" | "SOFTWARE",
    deviceProfileId: string,
    page = 0,
    pageSize = 100,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    textSearch?: string,
  ): Promise<PagedThingsboardResponse<OtaPackageInfo>> {
    const params = new URLSearchParams({
      type,
      deviceProfileId,
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortProperty,
      sortOrder,
    });

    if (textSearch?.trim()) {
      params.append("textSearch", textSearch.trim());
    }

    const { data } = await proxyApi.get<
      PagedThingsboardResponse<OtaPackageInfo>
    >(`/thingsboard/ota-packages?${params.toString()}`);
    return data;
  }
}
