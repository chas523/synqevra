import type { AxiosError } from 'axios';

/**
 * Extracts error message from various error types (Axios, Error, unknown)
 * Provides consistent error handling across the application
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage = 'An error occurred',
): string {
  // Handle Axios errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<{ message?: string }>;

    // Try to get message from response data
    const responseMessage = axiosError.response?.data?.message;
    if (responseMessage && typeof responseMessage === 'string') {
      return responseMessage;
    }

    // Fallback to status text or generic message
    if (axiosError.response?.statusText) {
      return axiosError.response.statusText;
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback for unknown error types
  return defaultMessage;
}

/**
 * Creates a standardized Error object with extracted message
 * Useful for re-throwing errors with consistent formatting
 */
export function createStandardError(
  error: unknown,
  defaultMessage = 'An error occurred',
): Error {
  const message = extractErrorMessage(error, defaultMessage);
  return new Error(message);
}
