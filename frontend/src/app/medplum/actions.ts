"use server";

import { cookies } from "next/headers";
import type { Customer, Device } from "@/lib/utils";

interface DevicesResponse {
  data: Device[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

interface CustomersResponse {
  data: Customer[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

interface ErrorResponse {
  message?: string;
}

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value || null;
}

export const fetchDevices = async (page: number = 0, pageSize: number = 10) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      throw new Error("BASE_URL environment variable is not set");
    }

    const response = await fetch(
      `${baseUrl}/api/deviceProfiles?pageSize=${pageSize}&page=${page}&sortProperty=createdTime&sortOrder=DESC`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Authentication failed. Please login again.");

      const errorData: ErrorResponse = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data: DevicesResponse = await response.json();
    // console.log('Devices fetched:', JSON.stringify(data, null, 2));
    return { success: true, data };
  } catch (err) {
    console.error("Failed to fetch devices:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
};

export const fetchCustomers = async (
  page: number = 0,
  pageSize: number = 10,
) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      throw new Error("BASE_URL environment variable is not set");
    }

    const response = await fetch(
      `${baseUrl}/api/customers?pageSize=${pageSize}&page=${page}&sortProperty=createdTime&sortOrder=DESC`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Authentication failed. Please login again.");

      const errorData: ErrorResponse = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data: CustomersResponse = await response.json();
    // console.log('Customers fetched:', JSON.stringify(data, null, 2));
    return { success: true, data };
  } catch (err) {
    console.error("Failed to fetch customers:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
};
