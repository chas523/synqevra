import { useState } from 'react';
import { mutate } from 'swr';
import { DeviceService } from '../services/deviceService';
import type { CreateDeviceRequest } from '../types';

export const useCreateDevice = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createDevice = async (deviceData: CreateDeviceRequest) => {
    setLoading(true);
    setError(null);
    try {
      const device = await DeviceService.createDevice(deviceData);
      return device;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createDevice, loading, error };
};
