"use server";

import { cookies } from "next/headers";
import { EntityId } from "../../../lib/utils";
import {
  RuleChainDetails,
  RuleChainMetadata,
  UpdateRuleChainRequest,
} from "../types/RuleChainTypes";
import { createApiResponse, createErrorResponse } from "../utils";

// Helper function for ThingsBoard API requests in server actions
async function thingsboardApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("BASE_URL environment variable is not set");
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If we can't parse JSON, use the default message
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

export const fetchRuleChainById = async (ruleChainId: string) => {
  try {
    const data = await thingsboardApiRequest<RuleChainDetails>(
      `/api/ruleChain/${ruleChainId}`
    );
    return createApiResponse(data);
  } catch (error) {
    console.error("Error fetching rule chain:", error);
    return createErrorResponse(error);
  }
};

export const fetchRuleChainMetadata = async (ruleChainId: string) => {
  try {
    const data = await thingsboardApiRequest<RuleChainMetadata>(
      `/api/ruleChain/${ruleChainId}/metadata`
    );
    return createApiResponse(data);
  } catch (error) {
    console.error("Error fetching rule chain metadata:", error);
    return createErrorResponse(error);
  }
};

export const updateRuleChain = async (
  ruleChainId: string,
  updateData: UpdateRuleChainRequest & { id: EntityId }
) => {
  try {
    const data = await thingsboardApiRequest<RuleChainDetails>(
      "/api/ruleChain",
      {
        method: "POST",
        body: JSON.stringify(updateData),
      }
    );
    return createApiResponse(data);
  } catch (error) {
    console.error("Error updating rule chain:", error);
    return createErrorResponse(error);
  }
};

export const updateRuleChainMetadata = async (metadata: RuleChainMetadata) => {
  try {
    const validatedMetadata = {
      ...metadata,
      firstNodeIndex:
        metadata.nodes.length > 0
          ? Math.max(
              0,
              Math.min(metadata.firstNodeIndex || 0, metadata.nodes.length - 1)
            )
          : null,
    };

    const data = await thingsboardApiRequest<RuleChainMetadata>(
      "/api/ruleChain/metadata",
      {
        method: "POST",
        body: JSON.stringify(validatedMetadata),
      }
    );
    return createApiResponse(data);
  } catch (error) {
    console.error("Error updating rule chain metadata:", error);
    return createErrorResponse(error);
  }
};
