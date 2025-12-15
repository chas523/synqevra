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

  static createException(message: string, error: unknown): never {
    const statusCode =
      error instanceof AxiosError ? error.response?.status : undefined;

    throw new ThingsboardApiException(message, statusCode, error);
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

    throw new MedplumApiError(message, statusCode, error);
  }
}
