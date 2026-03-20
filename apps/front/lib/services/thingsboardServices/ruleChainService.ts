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
}
