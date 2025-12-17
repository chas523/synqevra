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
import { DevicesResponse } from '../thingsboard.types';

@Injectable()
export class ThingsboardDeviceService {
  private readonly logger = new Logger(ThingsboardDeviceService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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
}
