import { useState } from 'react';
import useSWR from 'swr';
import { extractErrorMessage } from '@/lib/errorUtils';
import { ConnectionService } from '../services/connectionService';
import type {
  EstablishMedplumConnectionInterface,
  ThingsboardApiData,
  ThingsboardConnectionResponse,
  ThingsboardStatusResponse,
} from '../types';
export function useMedplumStatus() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/medplum/status',
    ConnectionService.checkMedplumStatus,
  );

  return {
    data,
    isLoading,
    error: error?.message || null,
    mutate,
  };
}

export function useThingsboardStatus() {
  // Check localStorage for thingsboard connection data
  const getThingsboardStatus = (): ThingsboardStatusResponse => {
    try {
      const thingsboardData = localStorage.getItem('thingsboard');
      if (thingsboardData) {
        const parsed = JSON.parse(thingsboardData);
        if (parsed.accessToken && parsed.tenantId) {
          return {
            status: 'Connected',
            tenantId: parsed.tenantId,
          };
        }
      }
      return { status: 'Disconnected' };
    } catch {
      return { status: 'Disconnected' };
    }
  };

  const [status, setStatus] = useState<ThingsboardStatusResponse>(
    getThingsboardStatus(),
  );

  const mutate = () => {
    setStatus(getThingsboardStatus());
  };

  return {
    status,
    loading: false,
    error: null,
    mutate,
  };
}

export function useEstablishMedplumConnection() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function establishMedplumConnection(
    medplumConnectionForm: EstablishMedplumConnectionInterface,
  ) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await ConnectionService.establishMedplumConnection(medplumConnectionForm);
      setSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err, 'Connection not established'));
    } finally {
      setLoading(false);
    }
  }

  return { establishMedplumConnection, isLoading, error, success };
}

export function useEstablishThingsboardConnection() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function establishThingsboardConnection(
    thingsboardConnectionForm: ThingsboardApiData,
  ): Promise<ThingsboardConnectionResponse | undefined> {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('in hook before');
      const response = await ConnectionService.establishThingsboardConnection(
        thingsboardConnectionForm,
      );
      console.log('in hook after');
      // Save data to localStorage as thingsboard object
      const thingsboardData = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        tenantId: response.tenantId,
      };
      localStorage.setItem('thingsboard', JSON.stringify(thingsboardData));

      // Log success message
      console.log('ThingsBoard connection success:', response.message);

      setSuccess(true);
      return response;
    } catch (err) {
      const errorMessage = extractErrorMessage(
        err,
        'Connection not established',
      );
      setError(errorMessage);
      throw err; // Propagate original error to component
    } finally {
      setLoading(false);
    }
  }

  return { establishThingsboardConnection, isLoading, error, success };
}
