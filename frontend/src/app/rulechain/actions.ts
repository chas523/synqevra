"use server";

import { cookies } from "next/headers";
import { EntityId } from "../../lib/utils";

export interface RuleChain {
  id?: EntityId;
  name?: string;
  type?: string;
  debugMode?: boolean;
  createdTime?: number;
  additionalInfo?: any;
}

export interface RuleChainResponse {
  data: RuleChain[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface CreateRuleChainRequest {
  name: string;
  type: string;
  debugMode: boolean;
}

interface ErrorResponse {
  message?: string;
}

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value || null;
}

export const fetchRuleChains = async () => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) throw new Error("BASE_URL environment variable is not set");

    const response = await fetch(
      `${baseUrl}/api/ruleChains?pageSize=10&page=0&sortProperty=createdTime&sortOrder=DESC`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Authentication failed. Please login again.");

      const errorData: ErrorResponse = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data: RuleChainResponse = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching rule chains:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const createRuleChain = async (
  ruleChainData: CreateRuleChainRequest
) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) throw new Error("BASE_URL environment variable is not set");

    const response = await fetch(`${baseUrl}/api/ruleChain`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ruleChainData),
    });

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Authentication failed. Please login again.");

      const errorData: ErrorResponse = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data: RuleChain = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error creating rule chain:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
