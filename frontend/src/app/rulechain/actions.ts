"use server";

import { cookies } from "next/headers";
import type {
  CreateRuleChainRequest,
  RuleChain,
  RuleChainResponse,
} from "./types/RuleChainTypes";
import { createApiResponse, createErrorResponse } from "./utils";

// Helper function for ThingsBoard API requests in server actions
async function thingsboardApiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
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

export const fetchRuleChains = async () => {
  try {
    const data = await thingsboardApiRequest<RuleChainResponse>(
      "/api/ruleChains?pageSize=10&page=0&sortProperty=createdTime&sortOrder=DESC",
    );
    return createApiResponse(data);
  } catch (error) {
    console.error("Error fetching rule chains:", error);
    return createErrorResponse(error);
  }
};

export const createRuleChain = async (
  ruleChainData: CreateRuleChainRequest,
) => {
  try {
    const newRuleChain = await thingsboardApiRequest<RuleChain>(
      "/api/ruleChain",
      {
        method: "POST",
        body: JSON.stringify(ruleChainData),
      },
    );

    console.log("created");

    // Fetch all rule chains to find the root one
    const allRuleChains = await thingsboardApiRequest<RuleChainResponse>(
      "/api/ruleChains?pageSize=999&page=0",
    );

    const rootRuleChain = allRuleChains.data.find(
      (rc: any) => rc.root === true,
    );
    console.log("Root RuleChain:", rootRuleChain);

    if (!rootRuleChain) {
      console.warn("No root rule chain found, skipping node addition");
      return createApiResponse(newRuleChain);
    }

    // Fetch root metadata and add new node
    const rootMetadata = await thingsboardApiRequest<any>(
      `/api/ruleChain/${rootRuleChain.id.id}/metadata`,
    );

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

    try {
      await thingsboardApiRequest("/api/ruleChain/metadata", {
        method: "POST",
        body: JSON.stringify(updatedRootMetadata),
      });
    } catch (error) {
      console.error(
        "Failed to update root rule chain metadata, but new rule chain was created",
      );
    }

    return createApiResponse(newRuleChain);
  } catch (error) {
    console.error("Error creating rule chain:", error);
    return createErrorResponse(error);
  }
};
