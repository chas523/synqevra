import { proxyApi } from "@/lib/api/api";

export interface RuleChain {
  id: {
    entityType: "RULE_CHAIN";
    id: string;
  };
  createdTime: number;
  tenantId: {
    entityType: "TENANT";
    id: string;
  };
  name: string;
  type: string;
  firstRuleNodeId?: {
    entityType: "RULE_NODE";
    id: string;
  };
  root: boolean;
  debugMode: boolean;
  externalId?: {
    entityType: "RULE_CHAIN";
    id: string;
  };
  version?: number;
  configuration?: any;
  additionalInfo?: {
    description?: string;
  } | null;
}

export interface RuleChainsResponse {
  data: RuleChain[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface CreateRuleChainRequest {
  name: string;
  type: string;
  debugMode?: boolean | null;
  additionalInfo?: {
    description?: string;
  } | null;
}

export class RuleChainService {
  public static async fetchRuleChains(
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    type = "CORE",
  ): Promise<RuleChainsResponse> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortProperty,
      sortOrder,
      type,
    });

    const { data } = await proxyApi.get<RuleChainsResponse>(
      `/thingsboard/ruleChains?${params.toString()}`,
    );
    return data;
  }

  public static async createRuleChain(
    payload: CreateRuleChainRequest,
  ): Promise<RuleChain> {
    const { data } = await proxyApi.post<RuleChain>(
      "/thingsboard/ruleChain",
      payload,
    );
    return data;
  }

  public static async deleteRuleChain(id: string): Promise<void> {
    await proxyApi.delete(`/thingsboard/ruleChain/${id}`);
  }

  public static async setRootRuleChain(id: string): Promise<RuleChain> {
    const { data } = await proxyApi.post<RuleChain>(
      `/thingsboard/ruleChain/${id}/root`,
    );
    return data;
  }

  public static async saveRuleChainMetadata(payload: {
    ruleChainId: { entityType: string; id: string };
    nodes: any[];
    connections: any[];
    firstNodeIndex?: number;
    version?: number;
  }): Promise<void> {
    await proxyApi.post("/thingsboard/ruleChain/metadata", payload);
  }

  public static async importRuleChain(json: {
    ruleChain: {
      name: string;
      type: string;
      firstRuleNodeId?: any;
      root?: boolean;
      debugMode?: boolean;
      configuration?: any;
      additionalInfo?: any;
    };
    metadata: {
      version?: number;
      firstNodeIndex?: number | null;
      nodes?: any[];
      connections?: any[];
      ruleChainConnections?: any;
    };
  }): Promise<RuleChain> {
    const { ruleChain, metadata } = json;

    const created = await RuleChainService.createRuleChain({
      name: ruleChain.name,
      type: ruleChain.type,
      debugMode: ruleChain.debugMode ?? false,
      additionalInfo: ruleChain.additionalInfo ?? null,
    });

    const sanitizedNodes = (metadata.nodes ?? []).map((node: any) => {
      if (!node?.configuration) return node;

      // Strip environment-specific references from all node types:
      // - originatorId/originatorType  → TbMsgGeneratorNode would send telemetry
      //   to user B's devices if kept.
      // - ruleChainId                  → TbRuleChainInputNode would route messages
      //   into user B's rule chain if kept. TB itself warns about this and
      //   requires manual re-linking after import.
      const { originatorId, originatorType, ruleChainId, ...restConfig } =
        node.configuration;

      return { ...node, configuration: restConfig };
    });

    await RuleChainService.saveRuleChainMetadata({
      ruleChainId: { entityType: "RULE_CHAIN", id: created.id.id },
      nodes: sanitizedNodes,
      connections: metadata.connections ?? [],
      firstNodeIndex:
        metadata.firstNodeIndex != null ? metadata.firstNodeIndex : undefined,
      // Do not forward the exported version — the freshly created chain starts
      // at version 0 and ThingsBoard would reject any other value with a 409.
    });

    return created;
  }

  public static async getRuleChain(id: string): Promise<RuleChain> {
    const { data } = await proxyApi.get<RuleChain>(
      `/thingsboard/ruleChain/${id}`,
    );
    return data;
  }

  public static async getRuleChainMetadata(id: string): Promise<any> {
    const { data } = await proxyApi.get<any>(
      `/thingsboard/ruleChain/${id}/metadata`,
    );
    return data;
  }

  public static async fetchEvents(
    entityType: string,
    id: string,
    tenantId: string,
    eventType: string,
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    startTime?: number,
    endTime?: number,
  ): Promise<any> {
    const params = new URLSearchParams({
      tenantId,
      page: String(page),
      pageSize: String(pageSize),
      sortProperty,
      sortOrder,
    });
    if (startTime) params.append("startTime", String(startTime));
    if (endTime) params.append("endTime", String(endTime));

    const { data } = await proxyApi.post<any>(
      `/thingsboard/events/${entityType}/${id}?${params.toString()}`,
      { eventType },
    );
    return data;
  }
}
