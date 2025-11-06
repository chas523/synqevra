import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  DevicesResponse,
  DeviceDetails,
  CreateDeviceRequest,
  Device,
  DeviceAttributes,
} from '../thingsboard.types';
import { MedplumService } from '../../medplum/medplum.service';

@Injectable()
export class ThingsboardDeviceService {
  private readonly logger = new Logger(ThingsboardDeviceService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly medplumService: MedplumService,
  ) {}

  private get THINGSBOARD_API_URL(): string {
    return (
      this.configService.getOrThrow<string>('THINGSBOARD_API_URL') + '/api'
    );
  }

  private handleThingsboardError(error: unknown): never {
    this.logger.error('ThingsBoard API error:', error);

    if (error instanceof AxiosError) {
      const status = error.response?.status;
      let errorMessage: string;

      if (
        error.response?.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        errorMessage = String(
          (error.response.data as { message: unknown }).message,
        );
      } else {
        errorMessage = error.message;
      }

      if (status === 401) {
        throw new UnauthorizedException(
          errorMessage || 'Invalid or expired ThingsBoard token',
        );
      }
      if (status === 400) {
        throw new BadRequestException(
          errorMessage || 'Bad request to ThingsBoard',
        );
      }
    }

    throw new InternalServerErrorException(
      'Failed to communicate with ThingsBoard',
    );
  }

  async fetchDevices(
    accessToken: string,
    page = 0,
    pageSize = 10,
  ): Promise<DevicesResponse> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/tenant/deviceInfos?pageSize=${pageSize}&page=${page}&sortProperty=createdTime&sortOrder=DESC`;
      const response = await firstValueFrom(
        this.httpService.get<DevicesResponse>(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleThingsboardError(error);
    }
  }

  async fetchDevice(accessToken: string, id: string): Promise<DeviceDetails> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/device/info/${id}`;
      const response = await firstValueFrom(
        this.httpService.get<DeviceDetails>(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleThingsboardError(error);
    }
  }

  async createDevice(
    accessToken: string,
    payload: CreateDeviceRequest,
    userId: number,
  ): Promise<Device> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/device`;
      const response = await firstValueFrom(
        this.httpService.post<Device>(url, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      try {
        await this.medplumService.createDevice(
          {
            identifier: response.data.id.id,
          },
          userId,
        );
      } catch (medplumError) {
        //if medplum fails - we're rollbacking creation of thingsboard device
        await this.deleteDevice(accessToken, response.data.id.id);
        throw medplumError;
      }
      return response.data;
    } catch (error) {
      this.handleThingsboardError(error);
    }
  }

  async deleteDevice(accessToken: string, id: string): Promise<void> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/device/${id}`;
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
    } catch (error) {
      this.handleThingsboardError(error);
    }
  }

  async fetchDeviceSharedAttributes(
    accessToken: string,
    id: string,
  ): Promise<DeviceAttributes> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/plugins/telemetry/DEVICE/${id}/values/attributes/SHARED_SCOPE`;
      const response = await firstValueFrom(
        this.httpService.get<DeviceAttributes>(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleThingsboardError(error);
    }
  }

  async updateDeviceSharedAttributes(
    accessToken: string,
    id: string,
    attributes: Record<string, any>,
  ): Promise<void> {
    try {
      const url = `${this.THINGSBOARD_API_URL}/plugins/telemetry/DEVICE/${id}/SHARED_SCOPE`;
      await firstValueFrom(
        this.httpService.post(url, attributes, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
    } catch (error) {
      this.handleThingsboardError(error);
    }
  }
}
