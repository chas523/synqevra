import { proxyApi } from "@/lib/api/api";
import type {
  TenantsRequestOptions,
  PaginatedResponse,
  Tenant,
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

      const response = await proxyApi.get<GetTenantsResponse>(
        `/dashboard/tenants?${params.toString()}`,
      );

      return this.mapTenantsResponse(response.data, options.limit ?? 20);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Failed to fetch tenants");
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
}

interface GetTenantsResponse {
  data: Tenant[];
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
