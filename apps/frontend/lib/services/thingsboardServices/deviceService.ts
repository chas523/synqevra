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

export interface CreateCalculatedFieldRequest {
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
    refEntityId?: string;
    timeSeriesKey?: string;
    name?: string;
    defaultValue?: string;
  }>;
  failuresEnabled?: boolean;
  allEnabled?: boolean;
  decimalsByDefault?: number;
}

type AttributeScope = "SERVER_SCOPE" | "CLIENT_SCOPE" | "SHARED_SCOPE";

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

export type DeviceTransportType =
  | "DEFAULT"
  | "MQTT"
  | "COAP"
  | "LWM2M"
  | "SNMP";

export type DeviceProfileProvisionType =
  | "DISABLED"
  | "ALLOW_CREATE_NEW_DEVICES"
  | "CHECK_PRE_PROVISIONED_DEVICES"
  | "X509_CERTIFICATE_CHAIN";

export type DeviceProfileProvisionConfiguration =
  | {
      type: "DISABLED";
      provisionDeviceSecret: null;
    }
  | {
      type: "ALLOW_CREATE_NEW_DEVICES" | "CHECK_PRE_PROVISIONED_DEVICES";
      provisionDeviceSecret: string;
    }
  | {
      type: "X509_CERTIFICATE_CHAIN";
      provisionDeviceSecret: string;
      certificateRegExPattern: string;
      allowCreateNewDevicesByX509Certificate: boolean;
    };

export interface RuleChain {
  id: { id: string; entityType: string };
  createdTime?: number;
  tenantId?: { id: string; entityType: string };
  name: string;
  type: "CORE" | "EDGE" | string;
  root?: boolean;
  debugMode?: boolean;
}

export interface DeviceProfile {
  id: { id: string; entityType: string };
  createdTime: number;
  tenantId: { id: string; entityType: string };
  name: string;
  description?: string | null;
  image?: string | null;
  type: string;
  transportType: string;
  provisionType: string;
  defaultRuleChainId?: { id: string; entityType: string } | null;
  defaultDashboardId?: { id: string; entityType: string } | null;
  defaultQueueName?: string | null;
  provisionDeviceKey?: string | null;
  firmwareId?: { id: string; entityType: string } | null;
  softwareId?: { id: string; entityType: string } | null;
  defaultEdgeRuleChainId?: { id: string; entityType: string } | null;
  externalId?: string | null;
  version: number;
  default: boolean;
  profileData?: {
    configuration?: { type?: string };
    transportConfiguration?: { type?: string };
    provisionConfiguration?:
      | (Partial<DeviceProfileProvisionConfiguration> & {
          type?: DeviceProfileProvisionType | string;
        })
      | undefined;
    alarms?: unknown;
  };
}

export interface DeviceProfileExport {
  name: string;
  description?: string | null;
  image?: string | null;
  type: string;
  transportType: string;
  provisionType: string;
  defaultRuleChainId?: { id: string; entityType: string } | null;
  defaultDashboardId?: { id: string; entityType: string } | null;
  defaultQueueName?: string | null;
  provisionDeviceKey?: string | null;
  firmwareId?: { id: string; entityType: string } | null;
  softwareId?: { id: string; entityType: string } | null;
  defaultEdgeRuleChainId?: { id: string; entityType: string } | null;
  default: false;
  profileData?: {
    configuration?: { type?: string };
    transportConfiguration?: { type?: string };
    provisionConfiguration?:
      | (Partial<DeviceProfileProvisionConfiguration> & {
          type?: DeviceProfileProvisionType | string;
        })
      | undefined;
    alarms?: unknown;
  };
}

export interface CreateDeviceProfileRequest {
  name: string;
  type: "DEFAULT";
  image: string | null;
  defaultQueueName?: string | null;
  transportType: DeviceTransportType;
  provisionType: DeviceProfileProvisionType;
  provisionDeviceKey: string | null;
  description?: string | null;
  profileData: {
    configuration: { type: "DEFAULT" };
    transportConfiguration: any;
    alarms: unknown[];
    provisionConfiguration: DeviceProfileProvisionConfiguration;
  };
  defaultRuleChainId?: { id: string; entityType: string } | null;
  defaultEdgeRuleChainId?: { id: string; entityType: string } | null;
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

export interface ReferenceEntityOption {
  id: string;
  name: string;
}

export class DeviceService {
  public static async fetchDevices(
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    deviceIds?: string,
  ): Promise<DevicesResponse> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortProperty,
      sortOrder,
    });

    if (deviceIds) {
      params.append("deviceIds", deviceIds);
    }

    const { data } = await proxyApi.get(
      `/thingsboard/devices?${params.toString()}`,
    );
    return data;
  }

  public static async fetchDevicesByIds(ids: string[]): Promise<any[]> {
    if (!ids.length) return [];
    const response = await this.fetchDevices(
      0,
      ids.length,
      "createdTime",
      "DESC",
      ids.join(","),
    );
    return response.data;
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
      `/thingsboard/devices/${id}/attributes?scope=SHARED_SCOPE`,
    );
    return data;
  }

  public static async fetchDeviceServerAttributes(
    id: string,
  ): Promise<DeviceAttributes> {
    const { data } = await proxyApi.get<DeviceAttributes>(
      `/thingsboard/devices/${id}/attributes?scope=SERVER_SCOPE`,
    );
    return data;
  }

  public static async fetchDeviceClientAttributes(
    id: string,
  ): Promise<DeviceAttributes> {
    const { data } = await proxyApi.get<DeviceAttributes>(
      `/thingsboard/devices/${id}/attributes?scope=CLIENT_SCOPE`,
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
    await DeviceService.updateDeviceAttributes(id, "SHARED_SCOPE", attributes);
  }

  public static async updateDeviceServerAttributes(
    id: string,
    attributes: Record<string, any>,
  ): Promise<void> {
    await DeviceService.updateDeviceAttributes(id, "SERVER_SCOPE", attributes);
  }

  public static async updateDeviceAttributes(
    id: string,
    scope: Exclude<AttributeScope, "CLIENT_SCOPE">,
    attributes: Record<string, any>,
  ): Promise<void> {
    await proxyApi.put<any>(
      `/thingsboard/devices/${id}/attributes?scope=${scope}`,
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

  public static async fetchDeviceProfileAttributes(
    id: string,
    scope: "SERVER_SCOPE" | "CLIENT_SCOPE" | "SHARED_SCOPE" = "SERVER_SCOPE",
  ): Promise<DeviceAttributes> {
    const { data } = await proxyApi.get<DeviceAttributes>(
      `/thingsboard/device-profiles/${id}/attributes?scope=${scope}`,
    );
    return Array.isArray(data) ? data : [];
  }

  public static async fetchDeviceProfileAttributeKeys(
    id: string,
    scope: "SERVER_SCOPE" | "CLIENT_SCOPE" | "SHARED_SCOPE" = "SERVER_SCOPE",
  ): Promise<string[]> {
    const { data } = await proxyApi.get<string[]>(
      `/thingsboard/device-profiles/${id}/attributes/keys?scope=${scope}`,
    );
    return Array.isArray(data) ? data : [];
  }

  public static async fetchDeviceProfileLatestTelemetryKeys(
    id: string,
  ): Promise<string[]> {
    const { data } = await proxyApi.get<string[]>(
      `/thingsboard/device-profiles/${id}/telemetry/latest/keys`,
    );
    return Array.isArray(data) ? data : [];
  }

  public static async fetchReferenceEntitiesByType(
    entityType: "device" | "asset" | "customer",
    page = 0,
    pageSize = 50,
  ): Promise<ReferenceEntityOption[]> {
    const typeMap: Record<"device" | "asset" | "customer", string> = {
      device: "DEVICE",
      asset: "ASSET",
      customer: "CUSTOMER",
    };

    const { data } = await proxyApi.get<PagedThingsboardResponse<any>>(
      `/thingsboard/entities/byType/${typeMap[entityType]}?page=${page}&pageSize=${pageSize}`,
    );

    const items = Array.isArray(data?.data) ? data.data : [];

    return items
      .map((item: any) => ({
        id: item?.id?.id,
        name: item?.name || item?.title || "",
      }))
      .filter((item: ReferenceEntityOption) => !!item.id && !!item.name);
  }

  public static async fetchReferenceEntityKeys(
    entityType: "DEVICE" | "ASSET" | "CUSTOMER",
    entityId: string,
    kind: "attribute" | "latest_telemetry",
    scope: "SERVER_SCOPE" | "CLIENT_SCOPE" | "SHARED_SCOPE" = "SERVER_SCOPE",
  ): Promise<string[]> {
    const { data } = await proxyApi.get<string[]>(
      `/thingsboard/entities/${entityType}/${entityId}/keys?kind=${kind}&scope=${scope}`,
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
    payload: CreateCalculatedFieldRequest,
  ): Promise<DeviceCalculatedField> {
    const { data } = await proxyApi.post<DeviceCalculatedField>(
      `/thingsboard/devices/${id}/calculated-fields`,
      payload,
    );
    return data;
  }

  public static async createDeviceProfileCalculatedField(
    id: string,
    payload: CreateCalculatedFieldRequest,
  ): Promise<DeviceCalculatedField> {
    const { data } = await proxyApi.post<DeviceCalculatedField>(
      `/thingsboard/device-profiles/${id}/calculated-fields`,
      payload,
    );
    return data;
  }

  public static async deleteCalculatedField(id: string): Promise<void> {
    await proxyApi.delete(`/thingsboard/calculated-field/${id}`);
  }

  public static async testCalculatedFieldScript(payload: {
    expression: string;
    arguments: Record<string, { ts: number; value: unknown; type: string }>;
  }): Promise<{ output: string; error: string }> {
    const { data } = await proxyApi.post<{ output: string; error: string }>(
      `/thingsboard/calculated-field/testScript`,
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

    if (startTime) params.append("startTime", startTime.toString());
    if (endTime) params.append("endTime", endTime.toString());

    const { data } = await proxyApi.post<any>(
      `/thingsboard/devices/${deviceId}/events?${params.toString()}`,
      { eventType: eventType || "LC_EVENT" },
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

  public static async saveDeviceRelation(
    deviceId: string,
    params: {
      relatedEntityId: string;
      relatedEntityType: string;
      relationType: string;
      direction: "FROM" | "TO";
    },
  ): Promise<void> {
    await proxyApi.post(`/thingsboard/devices/${deviceId}/relations`, params);
  }

  public static async deleteDeviceRelation(
    deviceId: string,
    params: {
      relatedEntityId: string;
      relatedEntityType: string;
      relationType: string;
      direction: "FROM" | "TO";
    },
  ): Promise<void> {
    await proxyApi.delete(`/thingsboard/devices/${deviceId}/relations`, {
      params,
    });
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

  public static async fetchDeviceProfiles(
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    textSearch?: string,
  ): Promise<PagedThingsboardResponse<DeviceProfile>> {
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
      PagedThingsboardResponse<DeviceProfile>
    >(`/thingsboard/device-profiles?${params.toString()}`);
    return data;
  }

  public static async createDeviceProfile(
    payload: CreateDeviceProfileRequest,
  ): Promise<void> {
    await proxyApi.post("/thingsboard/device-profiles", payload);
  }

  public static async updateDeviceProfile(
    payload: DeviceProfile | Record<string, unknown>,
  ): Promise<void> {
    await proxyApi.post("/thingsboard/device-profiles", payload);
  }

  public static async fetchDeviceProfile(id: string): Promise<DeviceProfile> {
    const { data } = await proxyApi.get<DeviceProfile>(
      `/thingsboard/device-profiles/${id}`,
    );
    return data;
  }

  public static async fetchDeviceProfileCalculatedFields(
    id: string,
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
  ): Promise<DeviceCalculatedFieldsResponse> {
    const { data } = await proxyApi.get<DeviceCalculatedFieldsResponse>(
      `/thingsboard/device-profiles/${id}/calculated-fields?page=${page}&pageSize=${pageSize}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`,
    );
    return data;
  }

  public static async getDeviceProfileAuditLogs(
    profileId: string,
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
      `/thingsboard/device-profiles/${profileId}/audit-logs?${params.toString()}`,
    );
    return data;
  }

  public static async getRuleChains(
    type?: "CORE" | "EDGE",
  ): Promise<RuleChain[]> {
    const params = new URLSearchParams({
      page: "0",
      pageSize: "50",
      sortProperty: "name",
      sortOrder: "ASC",
    });

    if (type) {
      params.append("type", type);
    }

    const { data } = await proxyApi.get<
      PagedThingsboardResponse<RuleChain> | RuleChain[]
    >(`/thingsboard/rule-chains?${params.toString()}`);

    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : [];

    return items;
  }

  public static async getRuleChainById(id: string): Promise<RuleChain> {
    const { data } = await proxyApi.get<RuleChain>(
      `/thingsboard/rule-chains/${id}`,
    );
    return data;
  }

  public static async exportDeviceProfile(
    id: string,
    inlineImages = true,
  ): Promise<DeviceProfile> {
    const { data } = await proxyApi.get<DeviceProfile>(
      `/thingsboard/device-profiles/${id}/export?inlineImages=${inlineImages}`,
    );
    return data;
  }

  public static toDeviceProfileExport(
    profile: DeviceProfile,
  ): DeviceProfileExport {
    return {
      name: profile.name,
      description: profile.description ?? null,
      image: profile.image ?? null,
      type: profile.type,
      transportType: profile.transportType,
      provisionType: profile.provisionType,
      defaultRuleChainId: profile.defaultRuleChainId ?? null,
      defaultDashboardId: profile.defaultDashboardId ?? null,
      defaultQueueName: profile.defaultQueueName ?? null,
      provisionDeviceKey: profile.provisionDeviceKey ?? null,
      firmwareId: profile.firmwareId ?? null,
      softwareId: profile.softwareId ?? null,
      defaultEdgeRuleChainId: profile.defaultEdgeRuleChainId ?? null,
      default: false,
      profileData: profile.profileData,
    };
  }

  public static async makeDeviceProfileDefault(id: string): Promise<void> {
    await proxyApi.post(`/thingsboard/device-profiles/${id}/default`);
  }

  public static async deleteDeviceProfile(id: string): Promise<void> {
    await proxyApi.delete(`/thingsboard/device-profiles/${id}`);
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
