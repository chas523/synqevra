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

export interface RuleChainLatestTelemetryResponse {
  [key: string]: Array<{
    ts: number;
    value: any;
  }>;
}

export interface CreateRuleChainRequest {
  name: string;
  type: string;
  debugMode?: boolean | null;
  additionalInfo?: {
    description?: string;
  } | null;
}

export interface RuleChainAuditLog {
  id: { entityType: string; id: string };
  createdTime: number;
  tenantId: { entityType: string; id: string };
  userName: string;
  actionType: string;
  actionStatus: string;
  actionData: any;
  actionFailureDetails: string | null;
  entityName: string;
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
      `/thingsboard/rule-chains?${params.toString()}`,
    );
    return data;
  }

  public static async createRuleChain(
    payload: CreateRuleChainRequest,
  ): Promise<RuleChain> {
    const { data } = await proxyApi.post<RuleChain>(
      "/thingsboard/rule-chains",
      payload,
    );
    return data;
  }

  public static async deleteRuleChain(id: string): Promise<void> {
    await proxyApi.delete(`/thingsboard/rule-chains/${id}`);
  }

  public static async setRootRuleChain(id: string): Promise<RuleChain> {
    const { data } = await proxyApi.post<RuleChain>(
      `/thingsboard/rule-chains/${id}/root`,
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
    await proxyApi.post("/thingsboard/rule-chains/metadata", payload);
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

  public static async getRuleChainById(id: string): Promise<RuleChain> {
    const { data } = await proxyApi.get<RuleChain>(
      `/thingsboard/rule-chains/${id}`,
    );
    return data;
  }

  public static async getRuleChain(id: string): Promise<RuleChain> {
    return this.getRuleChainById(id);
  }

  // Stubs and profile methods
  public static async getRuleChainProfileInfos(
    page = 0,
    pageSize = 100,
  ): Promise<any> {
    // Usually rule chains don't have profiles in the same way devices do,
    // but the cloned UI expects this. Returning empty for now or mapping if needed.
    return { data: [], totalPages: 0, totalElements: 0 };
  }

  public static async getOtaPackages(
    type: string,
    profileId: string,
    page = 0,
    pageSize = 100,
  ): Promise<any> {
    return { data: [], totalPages: 0, totalElements: 0 };
  }

  public static async fetchRuleChainSharedAttributes(id: string) {
    return this.fetchRuleChainAttributes(id);
  }

  public static async updateRuleChainServerAttributes(
    id: string,
    attributes: Record<string, any>,
  ) {
    await proxyApi.post(
      `/thingsboard/rule-chains/${id}/attributes?scope=SERVER_SCOPE`,
      attributes,
    );
  }

  public static async updateRuleChainSharedAttributes(
    id: string,
    attributes: Record<string, any>,
  ) {
    await proxyApi.post(
      `/thingsboard/rule-chains/${id}/attributes?scope=SHARED_SCOPE`,
      attributes,
    );
  }

  public static async deleteRuleChainAttributes(
    id: string,
    scope: string,
    keys: string,
  ) {
    await proxyApi.delete(
      `/thingsboard/rule-chains/${id}/attributes?scope=${scope}&keys=${keys}`,
    );
  }

  // Telemetry methods
  public static async addRuleChainLatestTelemetry(
    id: string,
    telemetry: Record<string, any>,
  ) {
    await proxyApi.post(`/thingsboard/rule-chains/${id}/telemetry`, telemetry);
  }

  // Relations methods
  public static async saveRuleChainRelation(ruleChainId: string, params: any) {
    await proxyApi.post(
      `/thingsboard/rule-chains/${ruleChainId}/relations`,
      params,
    );
  }

  public static async deleteRuleChainRelation(
    ruleChainId: string,
    params: {
      relatedEntityId: string;
      relatedEntityType: string;
      relationType: string;
      direction: "FROM" | "TO";
    },
  ) {
    const { relatedEntityId, relatedEntityType, relationType, direction } =
      params;
    await proxyApi.delete(`/thingsboard/rule-chains/${ruleChainId}/relations`, {
      params: { relatedEntityId, relatedEntityType, relationType, direction },
    });
  }

  public static async updateRuleChain(
    id: string,
    payload: any,
  ): Promise<RuleChain> {
    const { data } = await proxyApi.post<RuleChain>(
      `/thingsboard/rule-chains`,
      { ...payload, id: { id, entityType: "RULE_CHAIN" } },
    );
    return data;
  }

  public static async getRuleChainMetadata(id: string): Promise<any> {
    const { data } = await proxyApi.get<any>(
      `/thingsboard/rule-chains/${id}/metadata`,
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
      page: String(page),
      pageSize: String(pageSize),
      sortProperty,
      sortOrder,
    });
    if (tenantId) params.append("tenantId", tenantId);
    if (startTime) params.append("startTime", String(startTime));
    if (endTime) params.append("endTime", String(endTime));

    const { data } = await proxyApi.post<any>(
      `/thingsboard/rule-chains/${id}/events?${params.toString()}`,
      { eventType },
    );
    return data;
  }

  public static async fetchRuleChainAttributes(id: string): Promise<any[]> {
    const { data } = await proxyApi.get(
      `/thingsboard/rule-chains/${id}/attributes?scope=SERVER_SCOPE`,
    );
    return data;
  }

  public static async fetchRuleChainAttributeKeys(
    id: string,
  ): Promise<string[]> {
    const { data } = await proxyApi.get(
      `/thingsboard/rule-chains/${id}/attributes/keys?scope=SERVER_SCOPE`,
    );
    return data || [];
  }

  public static async getRuleChainAlarms(
    id: string,
    page = 0,
    pageSize = 10,
    statusList?: string[],
    severityList?: string[],
    startTime?: number,
    endTime?: number,
  ): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortProperty: "createdTime",
      sortOrder: "DESC",
    });
    if (statusList?.length) params.append("statusList", statusList.join(","));
    if (severityList?.length)
      params.append("severityList", severityList.join(","));
    if (startTime) params.append("startTime", startTime.toString());
    if (endTime) params.append("endTime", endTime.toString());
    const { data } = await proxyApi.get(
      `/thingsboard/rule-chains/${id}/alarms?${params.toString()}`,
    );
    return data;
  }

  public static async getRuleChainRelations(id: string): Promise<any[]> {
    const { data } = await proxyApi.get(
      `/thingsboard/rule-chains/${id}/relations?fromId=${id}&fromType=RULE_CHAIN`,
    );
    return data;
  }

  public static async getRuleChainAuditLogs(
    id: string,
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder = "DESC",
    startTime?: number,
    endTime?: number,
  ): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortProperty,
      sortOrder,
    });
    if (startTime) params.append("startTime", startTime.toString());
    if (endTime) params.append("endTime", endTime.toString());
    const { data } = await proxyApi.get(
      `/thingsboard/rule-chains/${id}/audit-logs?${params.toString()}`,
    );
    return data;
  }

  public static async fetchRuleChainLatestTelemetry(
    id: string,
    keys: string[],
  ): Promise<any> {
    const params = new URLSearchParams();
    if (keys.length > 0) params.append("keys", keys.join(","));
    const { data } = await proxyApi.get(
      `/thingsboard/rule-chains/${id}/telemetry/latest?${params.toString()}`,
    );
    return data;
  }

  public static async fetchRuleChainLatestTelemetryKeys(
    id: string,
  ): Promise<string[]> {
    const { data } = await proxyApi.get(
      `/thingsboard/rule-chains/${id}/telemetry/latest/keys`,
    );
    return data || [];
  }
}
