import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export const extractErrorMessage = (err: unknown): string => {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    if ("response" in err && err.response && typeof err.response === "object") {
      const response = err.response as { data?: { message?: string } };
      if (response.data?.message) return response.data.message;
    }
    if ("message" in err && typeof (err as any).message === "string") {
      return (err as any).message;
    }
  }
  return "Unknown error";
};

// Date formatting utilities
export const formatDate = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions,
) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Date(dateString).toLocaleDateString("en-US", {
    ...defaultOptions,
    ...options,
  });
};

export const formatDateShort = (dateString: string) => {
  return formatDate(dateString, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
