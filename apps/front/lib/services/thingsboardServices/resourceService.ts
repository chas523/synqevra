import { proxyApi } from "@/lib/api/api";
import {
  Resource,
  ResourceCreateRequest,
  ResourcesPageResponse,
} from "@/types/resourceTypes";

export class ResourceService {
  public static async getResources(
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    resourceType?: string,
    resourceSubType?: string,
  ): Promise<ResourcesPageResponse> {
    let url = `thingsboard/resources?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`;
    if (resourceType) {
      url += `&resourceType=${resourceType}`;
    }
    if (resourceSubType) {
      url += `&resourceSubType=${resourceSubType}`;
    }
    const { data } = await proxyApi.get(url);
    return data;
  }

  public static async getResourceInfo(resourceId: string): Promise<Resource> {
    const { data } = await proxyApi.get(
      `thingsboard/resource/info/${resourceId}`,
    );
    return data;
  }

  public static async createResource(
    resource: ResourceCreateRequest,
  ): Promise<Resource> {
    const { data } = await proxyApi.post("thingsboard/resources", resource);
    return data;
  }

  public static async deleteResource(
    resourceId: string,
    force: boolean = false,
  ): Promise<void> {
    await proxyApi.delete(`thingsboard/resources/${resourceId}?force=${force}`);
  }

  public static async downloadResource(resourceId: string): Promise<Blob> {
    const response = await proxyApi.get(
      `thingsboard/resources/${resourceId}/download`,
      {
        responseType: "blob",
      },
    );
    return response.data;
  }
}
