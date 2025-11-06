import useSWR from "swr";
import {
  type MedplumDevice,
  MedplumDeviceService,
} from "@/lib/services/medplumService/deviceService";

export interface UseMedplumDeviceResult {
  medplumDevice: MedplumDevice | null;
  isLoadingDevice: boolean;
  deviceError: Error | null;
  refreshDevice: () => void;
}

export const useMedplumDevice = (deviceId?: string): UseMedplumDeviceResult => {
  const {
    data: medplumDevice,
    error: deviceError,
    isLoading: isLoadingDevice,
    mutate: refreshDevice,
  } = useSWR(deviceId ? `medplum-device-${deviceId}` : null, () => {
    return deviceId ? MedplumDeviceService.fetchMedplumDevice(deviceId) : null;
  });

  return {
    medplumDevice: medplumDevice || null,
    isLoadingDevice,
    deviceError,
    refreshDevice,
  };
};
