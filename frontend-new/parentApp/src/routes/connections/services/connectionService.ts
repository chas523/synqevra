import { proxyApi } from '@/api/api';
import { createStandardError } from '@/lib/errorUtils';
import type {
  EstablishMedplumConnectionInterface,
  MedplumStatusResponse,
  ThingsboardApiData,
  ThingsboardConnectionResponse,
} from '../types';

export class ConnectionService {
  public static async checkMedplumStatus(): Promise<MedplumStatusResponse> {
    const { data } = await proxyApi.get('/medplum/status');
    return data;
  }

  public static async establishMedplumConnection(
    formData: EstablishMedplumConnectionInterface,
  ): Promise<void> {
    try {
      await proxyApi.post('/medplum/connect', formData);
    } catch (err: unknown) {
      throw createStandardError(err, 'Connection not established');
    }
  }

  public static async establishThingsboardConnection(
    formData: ThingsboardApiData,
  ): Promise<ThingsboardConnectionResponse> {
    try {
      const { data } = await proxyApi.post(
        '/thingsboard/connect/register',
        formData,
      );
      return data;
    } catch (err: unknown) {
      throw createStandardError(err, 'Connection not established');
    }
  }

  //next functionality
}
