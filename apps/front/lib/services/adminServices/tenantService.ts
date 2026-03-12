import { proxyApi } from "@/lib/api/api";
import type {
  TenantsRequestOptions,
  PaginatedResponse,
  Tenant,
  TenantProfile,
  TenantUser,
  DeviceData,
} from "@/lib/types/dashboardTypes";
import { extractErrorMessage } from "@/lib/utils";

export class TenantService {
  public static async getTenants(
    options: TenantsRequestOptions,
  ): Promise<PaginatedResponse<Tenant>> {
    try {
      const params = new URLSearchParams();

      params.append("page", (options.page ?? 0).toString());
      params.append("pageSize", (options.limit ?? 20).toString());

      if (options.sortBy) {
        params.append("sortProperty", options.sortBy);
      }

      if (options.sortOrder) {
        params.append("sortOrder", options.sortOrder.toUpperCase());
      }

      if (options.textSearch) {
        params.append("textSearch", options.textSearch as string);
      }

      const response = await proxyApi.get<GetTenantsResponse>(
        `/dashboard/tenants?${params.toString()}`,
      );

      return this.mapTenantsResponse(response.data, options.limit ?? 20);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Failed to fetch tenants");
      throw new Error(message);
    }
  }

  public static async getTenantProfiles(
    options: TenantsRequestOptions,
  ): Promise<PaginatedResponse<TenantProfile>> {
    try {
      const params = new URLSearchParams();

      params.append("page", (options.page ?? 0).toString());
      params.append("pageSize", (options.limit ?? 20).toString());

      if (options.sortBy) {
        params.append("sortProperty", options.sortBy);
      }

      if (options.sortOrder) {
        params.append("sortOrder", options.sortOrder.toUpperCase());
      }

      if (options.textSearch) {
        params.append("textSearch", options.textSearch as string);
      }

      const response = await proxyApi.get<GetTenantProfilesResponse>(
        `/dashboard/tenant-profiles?${params.toString()}`,
      );

      return this.mapTenantProfilesResponse(response.data, options.limit ?? 20);
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        "Failed to fetch tenant profiles",
      );
      throw new Error(message);
    }
  }

  public static async saveTenantProfile(
    tenantProfile: TenantProfile,
  ): Promise<TenantProfile> {
    try {
      const response = await proxyApi.post<TenantProfile>(
        `/dashboard/tenant-profiles/${tenantProfile.id.id}`,
        tenantProfile,
      );

      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Failed to save tenant profile");
      throw new Error(message);
    }
  }

  public static async getTenantProfileAttributes(
    profileId: string,
    scope: "SERVER_SCOPE" | "CLIENT_SCOPE" | "SHARED_SCOPE" = "SERVER_SCOPE",
  ): Promise<TenantAttribute[]> {
    try {
      const response = await proxyApi.get<TenantAttribute[]>(
        `/dashboard/tenant-profiles/${profileId}/attributes?scope=${scope}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to fetch attributes for tenant profile ${profileId}`,
      );
      throw new Error(message);
    }
  }

  public static async saveTenantProfileAttributes(
    profileId: string,
    attributes: Record<string, unknown>,
    scope: "SERVER_SCOPE" | "CLIENT_SCOPE" | "SHARED_SCOPE" = "SERVER_SCOPE",
  ): Promise<{ success: boolean }> {
    try {
      const response = await proxyApi.post<{ success: boolean }>(
        `/dashboard/tenant-profiles/${profileId}/attributes`,
        { scope, attributes },
      );
      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to save attributes for tenant profile ${profileId}`,
      );
      throw new Error(message);
    }
  }

  public static async getTenantProfileAlarms(
    profileId: string,
    page = 0,
    pageSize = 10,
    statusList?: string[],
    severityList?: string[],
    startTime?: number,
    endTime?: number,
  ): Promise<EntityAlarmsResponse> {
    try {
      let url = `/dashboard/tenant-profiles/${profileId}/alarms?page=${page}&pageSize=${pageSize}`;
      if (statusList && statusList.length > 0) {
        url += `&statusList=${statusList.join(",")}`;
      }
      if (severityList && severityList.length > 0) {
        url += `&severityList=${severityList.join(",")}`;
      }
      if (startTime !== undefined) {
        url += `&startTime=${startTime}`;
      }
      if (endTime !== undefined) {
        url += `&endTime=${endTime}`;
      }
      const response = await proxyApi.get<EntityAlarmsResponse>(url);
      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to fetch alarms for tenant profile ${profileId}`,
      );
      throw new Error(message);
    }
  }

  public static async getTenantById(tenantId: string): Promise<Tenant> {
    try {
      const response = await proxyApi.get<Tenant>(
        `/dashboard/tenants/${tenantId}`,
      );

      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to fetch tenant with id ${tenantId}`,
      );
      throw new Error(message);
    }
  }

  public static async getTenantUsers(
    tenantId: string,
    options: TenantsRequestOptions,
  ): Promise<PaginatedResponse<TenantUser>> {
    try {
      const params = new URLSearchParams();

      params.append("page", (options.page ?? 0).toString());
      params.append("pageSize", (options.limit ?? 20).toString());

      if (options.sortBy) {
        params.append("sortProperty", options.sortBy);
      }

      if (options.sortOrder) {
        params.append("sortOrder", options.sortOrder.toUpperCase());
      }

      const response = await proxyApi.get<GetTenantUsersResponse>(
        `/dashboard/tenants/${tenantId}/users? ${params.toString()}`,
      );

      return this.mapTenantUsersResponse(response.data, options.limit ?? 20);
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to fetch users for tenant ${tenantId}`,
      );
      throw new Error(message);
    }
  }

  public static async getTenantDevices(
    tenantId: string,
    options: TenantsRequestOptions,
  ): Promise<PaginatedResponse<DeviceData>> {
    try {
      const params = new URLSearchParams();

      params.append("page", (options.page ?? 0).toString());
      params.append("pageSize", (options.limit ?? 20).toString());

      if (options.sortBy) {
        params.append("sortProperty", options.sortBy);
      }

      if (options.sortOrder) {
        params.append("sortOrder", options.sortOrder.toUpperCase());
      }

      const response = await proxyApi.get<GetTenantDevicesResponse>(
        `/dashboard/tenants/${tenantId}/devices? ${params.toString()}`,
      );

      return this.mapTenantDevicesResponse(response.data, options.limit ?? 20);
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to fetch devices for tenant ${tenantId}`,
      );
      throw new Error(message);
    }
  }

  private static mapTenantsResponse(
    data: GetTenantsResponse,
    limit: number,
  ): PaginatedResponse<Tenant> {
    return {
      data: data.data || [],
      pagination: {
        limit,
        hasNext: data.hasNext ?? false,
        hasPrev: false,
        nextCursor: undefined,
        prevCursor: undefined,
      },
      total: data.totalElements ?? 0,
    };
  }

  private static mapTenantProfilesResponse(
    data: GetTenantProfilesResponse,
    limit: number,
  ): PaginatedResponse<TenantProfile> {
    return {
      data: data.data || [],
      pagination: {
        limit,
        hasNext: data.hasNext ?? false,
        hasPrev: false,
        nextCursor: undefined,
        prevCursor: undefined,
      },
      total: data.totalElements ?? 0,
    };
  }

  private static mapTenantUsersResponse(
    data: GetTenantUsersResponse,
    limit: number,
  ): PaginatedResponse<TenantUser> {
    return {
      data: (data.data || []).map((user) => ({
        ...user,
        createdAt: new Date(user.createdTime).toISOString(),
        updatedAt: new Date(user.createdTime).toISOString(),
      })),
      pagination: {
        limit,
        hasNext: data.hasNext ?? false,
        hasPrev: false,
        nextCursor: undefined,
        prevCursor: undefined,
      },
      total: data.totalElements ?? 0,
    };
  }

  private static mapTenantDevicesResponse(
    data: GetTenantDevicesResponse,
    limit: number,
  ): PaginatedResponse<DeviceData> {
    return {
      data: (data.data || []).map((device) => ({
        ...device,
        createdAt: new Date(device.createdTime).toISOString(),
        updatedAt: new Date(device.createdTime).toISOString(),
      })),
      pagination: {
        limit,
        hasNext: data.hasNext ?? false,
        hasPrev: false,
        nextCursor: undefined,
        prevCursor: undefined,
      },
      total: data.totalElements ?? 0,
    };
  }

  public static async getTenantAttributes(
    tenantId: string,
    scope: "SERVER_SCOPE" | "CLIENT_SCOPE" | "SHARED_SCOPE" = "SERVER_SCOPE",
  ): Promise<TenantAttribute[]> {
    try {
      const response = await proxyApi.get<TenantAttribute[]>(
        `/dashboard/tenants/${tenantId}/attributes?scope=${scope}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to fetch attributes for tenant ${tenantId}`,
      );
      throw new Error(message);
    }
  }

  public static async getTenantAlarms(
    tenantId: string,
    page = 0,
    pageSize = 10,
    statusList?: string[],
    severityList?: string[],
    startTime?: number,
    endTime?: number,
  ): Promise<EntityAlarmsResponse> {
    try {
      let url = `/dashboard/tenants/${tenantId}/alarms?page=${page}&pageSize=${pageSize}`;
      if (statusList && statusList.length > 0) {
        url += `&statusList=${statusList.join(",")}`;
      }
      if (severityList && severityList.length > 0) {
        url += `&severityList=${severityList.join(",")}`;
      }
      if (startTime !== undefined) {
        url += `&startTime=${startTime}`;
      }
      if (endTime !== undefined) {
        url += `&endTime=${endTime}`;
      }
      const response = await proxyApi.get<EntityAlarmsResponse>(url);
      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to fetch alarms for tenant ${tenantId}`,
      );
      throw new Error(message);
    }
  }

  public static async getTenantEvents(
    tenantId: string,
    page = 0,
    pageSize = 10,
    eventType?: string,
    startTime?: number,
    endTime?: number,
  ): Promise<EntityEventsResponse> {
    try {
      let url = `/dashboard/tenants/${tenantId}/events?page=${page}&pageSize=${pageSize}`;
      if (eventType) {
        url += `&eventType=${eventType}`;
      }
      if (startTime) {
        url += `&startTime=${startTime}`;
      }
      if (endTime) {
        url += `&endTime=${endTime}`;
      }
      const response = await proxyApi.get<EntityEventsResponse>(url);
      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to fetch events for tenant ${tenantId}`,
      );
      throw new Error(message);
    }
  }

  public static async getTenantRelations(
    tenantId: string,
    direction: "FROM" | "TO" = "FROM",
  ): Promise<EntityRelation[]> {
    try {
      const response = await proxyApi.get<EntityRelation[]>(
        `/dashboard/tenants/${tenantId}/relations?direction=${direction}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to fetch relations for tenant ${tenantId}`,
      );
      throw new Error(message);
    }
  }

  public static async updateTenant(
    tenantId: string,
    tenantData: UpdateTenantRequest,
  ): Promise<Tenant> {
    try {
      const response = await proxyApi.put<Tenant>(
        `/dashboard/tenants/${tenantId}`,
        tenantData,
      );
      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to update tenant ${tenantId}`,
      );
      throw new Error(message);
    }
  }

  public static async saveTenantAttributes(
    tenantId: string,
    attributes: Record<string, unknown>,
    scope: "SERVER_SCOPE" | "CLIENT_SCOPE" | "SHARED_SCOPE" = "SERVER_SCOPE",
  ): Promise<{ success: boolean }> {
    try {
      const response = await proxyApi.post<{ success: boolean }>(
        `/dashboard/tenants/${tenantId}/attributes`,
        { scope, attributes },
      );
      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to save attributes for tenant ${tenantId}`,
      );
      throw new Error(message);
    }
  }

  public static async deleteRelation(
    tenantId: string,
    relation: {
      fromId: string;
      fromType: string;
      relationType: string;
      toId: string;
      toType: string;
    },
  ): Promise<void> {
    try {
      const params = new URLSearchParams(relation);
      await proxyApi.delete(
        `/dashboard/tenants/${tenantId}/relations?${params.toString()}`,
      );
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to delete relation for tenant ${tenantId}`,
      );
      throw new Error(message);
    }
  }

  public static async saveRelation(
    tenantId: string,
    relation: any,
  ): Promise<void> {
    try {
      await proxyApi.post(`/dashboard/tenants/${tenantId}/relations`, relation);
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to save relation for tenant ${tenantId}`,
      );
      throw new Error(message);
    }
  }

  public static async getTenantConnectionStatus(
    tenantId: string,
  ): Promise<{ medplum: boolean | null }> {
    try {
      const response = await proxyApi.get<{ medplum: boolean | null }>(
        `/connection/get-status/${tenantId}`,
      );
      return response.data;
    } catch (err: unknown) {
      console.warn(
        `Failed to fetch connection status for tenant ${tenantId}`,
        err,
      );
      // Return null or default state on failure, or rethrow if critical
      return { medplum: null };
    }
  }

  public static async createMedplumTenant(dto: {
    tenantId: string;
  }): Promise<void> {
    try {
      await proxyApi.post(`/medplum/create`, dto);
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to create Medplum tenant for ${dto.tenantId}`,
      );
      throw new Error(message);
    }
  }

  public static async uploadWhitelabelImages(
    tenantId: string,
    formData: FormData,
  ): Promise<{ success: boolean; paths: Record<string, string> }> {
    try {
      // NOTE: We do not set Content-Type header here manually.
      // When posting FormData, axios/fetch will automatically set Content-Type
      // to multipart/form-data and calculate the proper boundary string.
      const response = await proxyApi.post<{
        success: boolean;
        paths: Record<string, string>;
      }>(`/dashboard/tenants/${tenantId}/whitelabel`, formData);
      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to upload whitelabel images for tenant ${tenantId}`,
      );
      throw new Error(message);
    }
  }

  public static async uploadGlobalWhitelabelImages(
    formData: FormData,
  ): Promise<{ success: boolean; paths: Record<string, string> }> {
    try {
      const response = await proxyApi.post<{
        success: boolean;
        paths: Record<string, string>;
      }>(`/dashboard/settings/whitelabel`, formData);
      return response.data;
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        `Failed to upload global whitelabel images`,
      );
      throw new Error(message);
    }
  }
}

export interface UpdateTenantRequest {
  title: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  address2?: string;
  zip?: string;
  phone?: string;
  email?: string;
  additionalInfo?: Record<string, unknown>;
}

interface GetTenantsResponse {
  data: Tenant[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

interface GetTenantProfilesResponse {
  data: TenantProfile[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

interface GetTenantUsersResponse {
  data: TenantUser[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}
interface GetTenantDevicesResponse {
  data: DeviceData[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface TenantAttribute {
  key: string;
  value: unknown;
  lastUpdateTs: number;
}

export interface EntityAlarmsResponse {
  data: AlarmInfo[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface AlarmInfo {
  id: { id: string; entityType: string };
  createdTime: number;
  name: string;
  type: string;
  severity: "CRITICAL" | "MAJOR" | "MINOR" | "WARNING" | "INDETERMINATE";
  status: "ACTIVE_UNACK" | "ACTIVE_ACK" | "CLEARED_UNACK" | "CLEARED_ACK";
  startTs: number;
  endTs?: number;
}

export interface EntityEventsResponse {
  data: EventInfo[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface EventInfo {
  id: { id: string; entityType: string };
  createdTime: number;
  type: string;
  uid: string;
  body: Record<string, unknown>;
}

export interface EntityRelation {
  from: { id: string; entityType: string };
  to: { id: string; entityType: string };
  type: string;
  typeGroup: string;
  fromName?: string;
  toName?: string;
}
