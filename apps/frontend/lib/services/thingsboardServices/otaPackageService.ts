import { proxyApi } from "@/lib/api/api";
import {
  OtaPackage,
  OtaPackagesPageResponse,
  CreateOtaPackageRequest,
} from "@/types/otaPackageTypes";

export class OtaPackageService {
  public static async getOtaPackages(
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
  ): Promise<OtaPackagesPageResponse> {
    const url = `thingsboard/otaPackages?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`;
    const { data } = await proxyApi.get(url);
    return data;
  }

  public static async createOtaPackage(
    payload: CreateOtaPackageRequest,
  ): Promise<OtaPackage> {
    const { data } = await proxyApi.post("thingsboard/otaPackage", payload);
    return data;
  }

  public static async deleteOtaPackage(id: string): Promise<void> {
    await proxyApi.delete(`thingsboard/otaPackage/${id}`);
  }

  public static async downloadOtaPackage(id: string): Promise<Blob> {
    const response = await proxyApi.get(
      `thingsboard/otaPackage/${id}/download`,
      {
        responseType: "blob",
      },
    );
    return response.data;
  }

  public static async getDeviceProfileInfos(): Promise<any> {
    const { data } = await proxyApi.get(
      "thingsboard/deviceProfileInfos?pageSize=100&page=0&sortProperty=name&sortOrder=ASC",
    );
    return data;
  }
}
