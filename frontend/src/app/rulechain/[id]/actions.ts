"use server";

import { cookies } from "next/headers";
import { EntityId } from "../../../lib/utils";

export interface RuleNode {
  id: EntityId;
  createdTime: number;
  ruleChainId: EntityId;
  type: string;
  name: string;
  debugSettings: {
    failuresEnabled: boolean;
    allEnabled: boolean;
    allEnabledUntil: number;
  };
  singletonMode: boolean;
  queueName: string | null;
  configurationVersion: number;
  configuration: any;
  externalId: string | null;
  additionalInfo: {
    description: string | null;
    layoutX: number;
    layoutY: number;
  };
}

export interface RuleChainConnection {
  fromIndex: number;
  toIndex: number;
  type: string;
}

export interface RuleChainMetadata {
  ruleChainId: EntityId;
  version: number;
  firstNodeIndex: number;
  nodes: RuleNode[];
  connections: RuleChainConnection[];
  ruleChainConnections: any;
}

export interface RuleChainDetails {
  id: EntityId;
  name: string;
  type: string;
  debugMode: boolean;
  createdTime: number;
  additionalInfo?: any;
  firstRuleNodeId?: EntityId;
  root?: boolean;
}

export interface UpdateRuleChainRequest {
  name: string;
  debugMode: boolean;
  additionalInfo?: any;
}

interface ErrorResponse {
  message?: string;
}

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value || null;
}

export const fetchRuleChainById = async (ruleChainId: string) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) throw new Error("BASE_URL environment variable is not set");

    const response = await fetch(`${baseUrl}/api/ruleChain/${ruleChainId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Authentication failed. Please login again.");

      const errorData: ErrorResponse = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data: RuleChainDetails = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching rule chain:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const fetchRuleChainMetadata = async (ruleChainId: string) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) throw new Error("BASE_URL environment variable is not set");

    const response = await fetch(
      `${baseUrl}/api/ruleChain/${ruleChainId}/metadata`,
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

    const data: RuleChainMetadata = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching rule chain metadata:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const updateRuleChain = async (
  ruleChainId: string,
  updateData: UpdateRuleChainRequest & { id: EntityId }
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
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Authentication failed. Please login again.");

      const errorData: ErrorResponse = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data: RuleChainDetails = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error updating rule chain:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const updateRuleChainMetadata = async (metadata: RuleChainMetadata) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) throw new Error("BASE_URL environment variable is not set");

    const response = await fetch(`${baseUrl}/api/ruleChain/metadata`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Authentication failed. Please login again.");

      const errorData: ErrorResponse = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data: RuleChainMetadata = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error updating rule chain metadata:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
