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

export class DeviceService {
  public static async fetchDevices(
    page = 0,
    pageSize = 10
  ): Promise<DevicesResponse> {
    const { data } = await proxyApi.get(
      `/thingsboard/devices?page=${page}&pageSize=${pageSize}`
    );
    return data;
  }

  public static async fetchDevice(id: string): Promise<DeviceDetails> {
    const { data } = await proxyApi.get<DeviceDetails>(
      `/thingsboard/devices/${id}`
    );
    return data;
  }

  public static async createDevice(
    payload: CreateDeviceRequest
  ): Promise<Device> {
    const { data } = await proxyApi.post<Device>(
      "/thingsboard/devices",
      payload
    );
    return data;
  }

  public static async fetchDeviceSharedAttributes(
    id: string
  ): Promise<DeviceAttributes> {
    const { data } = await proxyApi.get<DeviceAttributes>(
      `/thingsboard/devices/${id}/attributes`
    );
    return data;
  }
  public static async updateDeviceSharedAttributes(
    id: string,
    attributes: Record<string, any>
  ): Promise<void> {
    await proxyApi.put<any>(
      `/thingsboard/devices/${id}/attributes`,
      attributes
    );
  }
}
