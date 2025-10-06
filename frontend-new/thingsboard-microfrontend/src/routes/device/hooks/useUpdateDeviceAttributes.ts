import { useState } from 'react';
import { mutate } from 'swr';
import { DeviceService } from '../services/deviceService';

export const useUpdateDeviceAttributes = (deviceId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateAttributes = async (limits: Record<string, number | string>) => {
    setLoading(true);
    setError(null);

    try {
      // Aktualizuj limits i telemetry_keys jednocześnie
      const telemetryKeys = Object.keys(limits);
      //   const telemetryKeys = {telemetryKeys: Object.keys(limits)};

      const attributesToUpdate = {
        limits,
        telemetry_keys: telemetryKeys,
      };
      console.log('Updating attributes:', { limits, telemetryKeys });
      //   await DeviceService.updateDeviceSharedAttributes(deviceId, limits);
      await DeviceService.updateDeviceSharedAttributes(
        deviceId,
        attributesToUpdate,
      );

      // Odśwież cache dla atrybutów urządzenia
      mutate(`device-attributes-${deviceId}`);

      return true;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateAttributes, loading, error };
};
