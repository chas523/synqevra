import useSWR from 'swr';
import { DeviceService } from '../services/deviceService';
import type { DeviceAttributes, DeviceDetails } from '../types';

export interface UseDeviceResult {
  device: DeviceDetails | null;
  attributes: DeviceAttributes | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useDevice(deviceId: string | undefined): UseDeviceResult {
  // Pobieranie szczegółów urządzenia
  const {
    data: device,
    error: deviceError,
    isLoading: deviceLoading,
    mutate: refreshDevice,
  } = useSWR<DeviceDetails>(
    deviceId ? `device-${deviceId}` : null,
    deviceId ? () => DeviceService.fetchDevice(deviceId) : null,
  );

  // Pobieranie atrybutów urządzenia
  const {
    data: attributes,
    error: attributesError,
    isLoading: attributesLoading,
    mutate: refreshAttributes,
  } = useSWR<DeviceAttributes>(
    deviceId ? `device-attributes-${deviceId}` : null,
    deviceId ? () => DeviceService.fetchDeviceSharedAttributes(deviceId) : null,
  );

  // Kombinacja błędów i stanów ładowania
  const error = deviceError || attributesError;
  const isLoading = deviceLoading || attributesLoading;

  // Funkcja odświeżania obu zapytań
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
