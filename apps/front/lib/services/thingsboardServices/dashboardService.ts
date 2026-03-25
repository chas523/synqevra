import { proxyApi } from "@/lib/api/api";
import { DashboardsResponse, Dashboard } from '@/types/dashboardTypes';

export class DashboardService {
  static async getTenantDashboards(
    pageSize: number = 10,
    page: number = 0,
    sortProperty: string = 'createdTime',
    sortOrder: string = 'DESC',
  ): Promise<DashboardsResponse> {
    const response = await proxyApi.get('/thingsboard/tenant/dashboards', {
      params: { pageSize, page, sortProperty, sortOrder },
    });
    return response.data;
  }

  static async getDashboardById(
    id: string,
    includeResources: boolean = false,
  ): Promise<any> {
    const response = await proxyApi.get(`/thingsboard/dashboard/${id}`, {
      params: { includeResources: includeResources ? 'true' : undefined },
    });
    return response.data;
  }

  static async makeDashboardCustomerPublic(id: string): Promise<any> {
    const response = await proxyApi.post(
      `/thingsboard/customer/public/dashboard/${id}`,
      {},
    );
    return response.data;
  }

  static async makeDashboardCustomerPrivate(id: string): Promise<any> {
    const response = await proxyApi.delete(
      `/thingsboard/customer/public/dashboard/${id}`,
    );
    return response.data;
  }

  static async getCustomerById(id: string): Promise<any> {
    const response = await proxyApi.get(`/thingsboard/customer/${id}`);
    return response.data;
  }

  static async getCustomers(
    pageSize: number = 50,
    page: number = 0,
    sortProperty: string = 'title',
    sortOrder: string = 'ASC',
    textSearch?: string,
  ): Promise<any> {
    const response = await proxyApi.get('/thingsboard/customers', {
      params: { pageSize, page, sortProperty, sortOrder, textSearch },
    });
    return response.data;
  }

  static async saveDashboard(dashboard: any): Promise<any> {
    const { data } = await proxyApi.post(`/thingsboard/dashboard`, dashboard);
    return data;
  }

  static async updateDashboardCustomers(
    dashboardId: string,
    customerIds: string[],
  ): Promise<any> {
    const response = await proxyApi.post(
      `/thingsboard/dashboard/${dashboardId}/customers`,
      customerIds,
    );
    return response.data;
  }

  static async deleteDashboard(id: string): Promise<void> {
    await proxyApi.delete(`/thingsboard/dashboard/${id}`);
  }

  static async getDashboardAuditLogs(
    id: string,
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    startTime?: number,
    endTime?: number,
  ): Promise<any> {
    const { data } = await proxyApi.get(`/thingsboard/dashboards/${id}/audit-logs`, {
      params: {
        page,
        pageSize,
        sortProperty,
        sortOrder,
        startTime,
        endTime,
      },
    });
    return data;
  }
}
