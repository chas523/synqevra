import { AxiosError } from 'axios';

export class MailerError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'MailerError';
  }

  static createException(message: string, error: unknown): never {
    const statusCode =
      error instanceof AxiosError ? error.response?.status : undefined;

    throw new MailerError(message, statusCode, error);
  }
}
