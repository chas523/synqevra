import { thingsBoardApi } from '@/api/api';
import type {
  CreateDeviceRequest,
  Device,
  DeviceAttributes,
  DeviceDetails,
} from '../types';

export interface DevicesResponse {
  data: Device[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export class DeviceService {
  public static async fetchDevices(
    page = 0,
    pageSize = 10,
  ): Promise<DevicesResponse> {
    const { data } = await thingsBoardApi.get(
      `/api/tenant/deviceInfos?pageSize=${pageSize}&page=${page}&sortProperty=createdTime&sortOrder=DESC`,
    );
    return data;
  }

  public static async fetchDevice(id: string): Promise<DeviceDetails> {
    const { data } = await thingsBoardApi.get<DeviceDetails>(
      `/api/device/info/${id}`,
    );
    return data;
  }

  public static async createDevice(
    payload: CreateDeviceRequest,
  ): Promise<Device> {
    const { data } = await thingsBoardApi.post<Device>('/api/device', payload);
    return data;
  }

  public static async fetchDeviceSharedAttributes(
    id: string,
  ): Promise<DeviceAttributes> {
    const { data } = await thingsBoardApi.get<DeviceAttributes>(
      `/api/plugins/telemetry/DEVICE/${id}/values/attributes/SHARED_SCOPE`,
    );
    return data;
  }
  public static async updateDeviceSharedAttributes(
    id: string,
    attributes: Record<string, any>,
  ): Promise<void> {
    await thingsBoardApi.post<any>(
      `/api/plugins/telemetry/DEVICE/${id}/SHARED_SCOPE`,
      attributes,
    );
  }
}
