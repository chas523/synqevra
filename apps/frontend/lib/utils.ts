import type { AxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getImagePreviewUrl = (link?: string): string => {
  if (!link) return "";
  if (link.startsWith("data:") || link.startsWith("http")) return link;

  // Handle ThingsBoard specific prefix
  let cleanLink = link;
  if (link.startsWith("tb-image;")) {
    cleanLink = link.replace("tb-image;", "");
  }

  // Use the frontend proxy route that handles image downloads and previews correctly
  // Pattern taken from ScadaSymbolsTable.tsx and ImageGalleryTable.tsx
  const previewLink = cleanLink.endsWith("/preview")
    ? cleanLink
    : `${cleanLink}/preview`;
  return `/api/thingsboard/images/download/${encodeURIComponent(previewLink)}`;
};

/**
 * Extracts error message from various error types (Axios, Error, unknown)
 * Provides consistent error handling across the application
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage = "An error occurred",
): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<{ message?: string }>;

    const responseMessage = axiosError.response?.data?.message;
    if (responseMessage && typeof responseMessage === "string") {
      return responseMessage;
    }

    if (axiosError.response?.statusText) {
      return axiosError.response.statusText;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return defaultMessage;
}

/**
 * Creates a standardized Error object with extracted message
 * Useful for re-throwing errors with consistent formatting
 */
export function createStandardError(
  error: unknown,
  defaultMessage = "An error occurred",
): Error {
  const message = extractErrorMessage(error, defaultMessage);
  return new Error(message);
}

export const getThresholdColor = (thresholdType: string): string => {
  switch (thresholdType) {
    case "minimum":
      return "bg-chart-1/15 border-chart-1/40";
    case "maximum":
      return "bg-destructive/10 border-destructive/30";
    case "equal":
      return "bg-chart-2/15 border-chart-2/40";
    case "not_equal":
      return "bg-chart-4/20 border-chart-4/45";
    default:
      return "bg-muted border-border";
  }
};

export const getThresholdLabel = (thresholdType: string): string => {
  switch (thresholdType) {
    case "minimum":
      return "Min";
    case "maximum":
      return "Max";
    case "equal":
      return "Equal";
    case "not_equal":
      return "Not Equal";
    default:
      return thresholdType;
  }
};

export const formatParameterValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return String(value);
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTenantDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const buildQueryParams = (
  options: Record<string, unknown>,
): URLSearchParams => {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  return params;
};
