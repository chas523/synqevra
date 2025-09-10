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
    console.log("created");
    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Authentication failed. Please login again.");

      const errorData: ErrorResponse = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const newRuleChain: RuleChain = await response.json();

    const allRuleChainsResponse = await fetch(
      `${baseUrl}/api/ruleChains?pageSize=999&page=0`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!allRuleChainsResponse.ok) {
      throw new Error("Failed to fetch all rule chains");
    }

    const allRuleChains = await allRuleChainsResponse.json();
    const rootRuleChain = allRuleChains.data.find(
      (rc: any) => rc.root === true
    );
    console.log("Root RuleChain:", rootRuleChain);
    if (!rootRuleChain) {
      console.warn("No root rule chain found, skipping node addition");
      return { success: true, data: newRuleChain };
    }

    const rootMetadataResponse = await fetch(
      `${baseUrl}/api/ruleChain/${rootRuleChain.id.id}/metadata`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!rootMetadataResponse.ok) {
      throw new Error("Failed to fetch root rule chain metadata");
    }

    const rootMetadata = await rootMetadataResponse.json();

    const newNodeIndex = rootMetadata.nodes.length;
    const newNode = {
      createdTime: Date.now(),
      ruleChainId: rootRuleChain.id,
      type: "org.thingsboard.rule.engine.flow.TbRuleChainInputNode",
      name: newRuleChain.name,
      debugSettings: {
        failuresEnabled: false,
        allEnabled: false,
        allEnabledUntil: 0,
      },
      singletonMode: false,
      queueName: null,
      configurationVersion: 0,
      configuration: {
        forwardMsgToDefaultRuleChain: false,
        ruleChainId: newRuleChain.id.id,
      },
      externalId: null,
      additionalInfo: {
        description: "",
        layoutX: 200 + newNodeIndex * 200,
        layoutY: 300,
      },
    };

    const newConnection = {
      fromIndex: 0,
      toIndex: newNodeIndex,
      type: "Success",
    };

    const updatedRootMetadata = {
      ...rootMetadata,
      nodes: [...rootMetadata.nodes, newNode],
      connections: [...rootMetadata.connections, newConnection],
      version: rootMetadata.version,
    };
    console.log("Updated Root Metadata:", updatedRootMetadata);
    const updateResponse = await fetch(`${baseUrl}/api/ruleChain/metadata`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedRootMetadata),
    });

    if (!updateResponse.ok) {
      console.error(
        "Failed to update root rule chain metadata, but new rule chain was created"
      );
    }

    return { success: true, data: newRuleChain };
  } catch (error) {
    console.error("Error creating rule chain:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
