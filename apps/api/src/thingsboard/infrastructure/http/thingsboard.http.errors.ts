import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

export class ThingsboardApiException extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'ThingsboardApiException';
  }

  static createException(
    message: string,
    error: unknown,
    logger?: Logger,
  ): never {
    const statusCode =
      error instanceof AxiosError ? error.response?.status : undefined;

    const apiMessage =
      error instanceof AxiosError && error.response?.data?.message
        ? error.response.data.message
        : message;

    // Pass the full response data as the originalError if available, so we can access 'references'
    const errorData = error instanceof AxiosError && error.response?.data ? error.response.data : error;

    logger?.error(message + ' ' + apiMessage);
    throw new ThingsboardApiException(apiMessage, statusCode, errorData);
  }
}

//import from medplum module when medplum ddd is available
export class MedplumApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'MedplumApiError';
  }

  static createException(message: string, error: unknown): never {
    const statusCode =
      error instanceof AxiosError ? error.response?.status : undefined;

    // Wyciągnij message z API response jeśli dostępny
    const apiMessage =
      error instanceof AxiosError && error.response?.data?.message
        ? error.response.data.message
        : message;

    throw new MedplumApiError(apiMessage, statusCode, error);
  }
}
