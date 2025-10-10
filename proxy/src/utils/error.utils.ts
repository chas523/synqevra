import { HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';

export function getErrorStatus(error: unknown): number | undefined {
  // Safely determine the HTTP status from various error shapes
  if (!error) {
    return undefined;
  }

  // Nest HttpException
  if (error instanceof HttpException) {
    try {
      return error.getStatus();
    } catch {
      // fall through
    }
  }

  // Axios error
  const axiosErr = error as AxiosError;
  if (axiosErr?.isAxiosError) {
    return axiosErr.response?.status;
  }

  return undefined;
}

export function getErrorMessage(error: unknown): string {
  if (!error) {
    return 'Unknown error';
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  const axiosErr = error as AxiosError;
  if (axiosErr?.isAxiosError) {
    // Try to extract a useful message from Axios response body if present
    const data = axiosErr.response?.data;
    if (data !== undefined && data !== null) {
      if (typeof data === 'string') {
        return data;
      }
      if (typeof data === 'object') {
        const obj = data as Record<string, unknown>;
        if (typeof obj.message === 'string') {
          return obj.message;
        }
        if (typeof obj.error === 'string') {
          return obj.error;
        }
        // If message/error exist but are not strings, attempt to stringify the object
        if (obj.message !== undefined || obj.error !== undefined) {
          try {
            return JSON.stringify(obj);
          } catch {
            // fall through
          }
        }
      }
    }
    return axiosErr.message || 'Request failed';
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}
