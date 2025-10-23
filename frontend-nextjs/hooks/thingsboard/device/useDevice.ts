import useSWR from "swr";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import type {
  DeviceAttributes,
  DeviceDetails,
} from "@/types/thingsboardDeviceTypes";

export interface UseDeviceResult {
  device: DeviceDetails | null;
  attributes: DeviceAttributes | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useDevice(deviceId: string | undefined): UseDeviceResult {
  //device details
  const {
    data: device,
    error: deviceError,
    isLoading: deviceLoading,
    mutate: refreshDevice,
  } = useSWR<DeviceDetails>(
    deviceId ? `device-${deviceId}` : null,
    deviceId ? () => {
      console.log('📱 DEVICE FETCH CALLED for:', deviceId);
      return DeviceService.fetchDevice(deviceId);
    } : null,
  );

  //device attributes
  const {
    data: attributes,
    error: attributesError,
    isLoading: attributesLoading,
    mutate: refreshAttributes,
  } = useSWR<DeviceAttributes>(
    deviceId ? `device-attributes-${deviceId}` : null,
    deviceId ? () => {
      console.log('🔧 DEVICE ATTRIBUTES FETCH CALLED for:', deviceId);
      return DeviceService.fetchDeviceSharedAttributes(deviceId);
    } : null,
  );

  const error = deviceError || attributesError;
  const isLoading = deviceLoading || attributesLoading;

  const refresh = () => {
    refreshDevice();
    refreshAttributes();
  };

  return {
    device: device || null,
    attributes: attributes || null,
    isLoading,
    error,
    refresh,
  };
}
