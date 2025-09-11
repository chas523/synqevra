import { FlowNode, FlowConnection } from "../types/NodeTypes";
import { RuleNode, RuleChainMetadata } from "../types/RuleChainTypes";
/**
 * Format success response
 */
export function createApiResponse<T>(data: T) {
  return { success: true as const, data };
}
/**
 * Format error response
 */
export function createErrorResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown error occurred";
  return { success: false as const, error: message };
}
/**
 * Date formatting utilities
 */
export const formatDate = (timestamp?: number): string => {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleString();
};

/**
 * Generate temporary ID for new nodes
 */
export const generateTempId = (): string =>
  `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Convert RuleChain nodes to Flow nodes for UI
 */
export const convertToFlowNodes = (ruleNodes: RuleNode[]): FlowNode[] => {
  return ruleNodes.map((node, index) => ({
    id: node.id.id,
    type: node.type,
    name: node.name,
    configuration: node.configuration,
    position: index,
  }));
};

/**
 * Convert RuleChain connections to Flow connections for UI
 */
export const convertToFlowConnections = (
  connections: any[]
): FlowConnection[] => {
  return connections.map((conn) => ({
    fromIndex: conn.fromIndex,
    toIndex: conn.toIndex,
    type: conn.type,
  }));
};

/**
 * Convert Flow nodes back to RuleChain format for API
 */
export const convertFromFlowNodes = (
  flowNodes: FlowNode[],
  ruleChainId: any
): any[] => {
  return flowNodes.map((node, index) => {
    const baseNode = {
      createdTime: Date.now(),
      ruleChainId,
      type: node.type,
      name: node.name,
      debugSettings: {
        failuresEnabled: false,
        allEnabled: false,
        allEnabledUntil: 0,
      },
      singletonMode: false,
      queueName: "Main",
      configurationVersion: 0,
      configuration: node.configuration,
      externalId: null,
      additionalInfo: {
        description: null,
        layoutX: index * 200 + 100,
        layoutY: 200,
      },
    };

    // Only include id for existing nodes (not temporary ones)
    if (!node.id.startsWith("temp_")) {
      return {
        ...baseNode,
        id: { entityType: "RULE_NODE", id: node.id },
      };
    }

    return baseNode;
  });
};

/**
 * Create updated metadata object
 */
export const createUpdatedMetadata = (
  metadata: RuleChainMetadata,
  nodes: any[],
  connections: FlowConnection[],
  version: number
): RuleChainMetadata => {
  const firstNodeIndex = nodes.length > 0 ? 0 : null;
  const validConnections = nodes.length > 0 ? connections : [];

  return {
    ...metadata,
    nodes,
    connections: validConnections.map((conn) => ({
      fromIndex: conn.fromIndex,
      toIndex: conn.toIndex,
      type: conn.type,
    })),
    firstNodeIndex,
    version,
  };
};

/**
 * Get bearer token from localStorage
 */
export const getBearerTokenFromLocalStorage = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const activeLogin = localStorage.getItem("activeLogin");
    if (!activeLogin) return null;
    const parsed = JSON.parse(activeLogin);
    return parsed.accessToken || null;
  } catch {
    return null;
  }
};

/**
 * Patient name utilities
 */
export interface Patient {
  id: string;
  name?: Array<{
    given?: string[];
    family?: string;
  }>;
}

export const getPatientDisplayName = (patient: Patient): string => {
  if (patient.name && patient.name.length > 0) {
    const name = patient.name[0];
    const given = name.given?.join(" ") || "";
    const family = name.family || "";
    return `${given} ${family}`.trim() || `Patient ${patient.id}`;
  }
  return `Patient ${patient.id}`;
};
