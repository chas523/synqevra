import { thingsBoardApi } from '@/api/api';
import type {
  CreateRuleChainRequest,
  EntityId,
  RuleChain,
  RuleChainDetails,
  RuleChainMetadata,
  UpdateRuleChainRequest,
} from '../types/RuleChainTypes';

export class RuleChainService {
  public static async fetchRuleChains(): Promise<RuleChain[]> {
    const { data } = await thingsBoardApi.get(
      '/api/ruleChains?pageSize=10&page=0&sortProperty=createdTime&sortOrder=DESC',
    );
    return data.data;
  }

  public static async fetchRuleChain(id: string): Promise<RuleChainDetails> {
    const { data } = await thingsBoardApi.get<RuleChainDetails>(
      `/api/ruleChain/${id}`,
    );
    return data;
  }

  public static async createRuleChain(
    payload: CreateRuleChainRequest,
  ): Promise<RuleChain> {
    const { data } = await thingsBoardApi.post<RuleChain>(
      '/api/ruleChain',
      payload,
    );
    return data;
  }

  public static async fetchRuleChainById(
    ruleChainId: string,
  ): Promise<RuleChainDetails> {
    const { data } = await thingsBoardApi.get<RuleChainDetails>(
      `/api/ruleChain/${ruleChainId}`,
    );
    return data;
  }
  public static async updateRuleChain(
    _ruleChainId: string,
    updateData: UpdateRuleChainRequest & { id: EntityId },
  ): Promise<RuleChainDetails> {
    const { data } = await thingsBoardApi.post<RuleChainDetails>(
      '/api/ruleChain',
      updateData,
    );
    return data;
  }

  public static async fetchRuleChainMetadata(
    ruleChainId: string,
  ): Promise<RuleChainMetadata> {
    const { data } = await thingsBoardApi.get<RuleChainMetadata>(
      `/api/ruleChain/${ruleChainId}/metadata`,
    );
    return data;
  }

  public static async updateRuleChainMetadata(
    metadata: RuleChainMetadata,
  ): Promise<RuleChainMetadata> {
    const validated = {
      ...metadata,
      firstNodeIndex:
        metadata.nodes.length > 0
          ? Math.max(
              0,
              Math.min(metadata.firstNodeIndex || 0, metadata.nodes.length - 1),
            )
          : null,
    };

    const { data } = await thingsBoardApi.post<RuleChainMetadata>(
      '/api/ruleChain/metadata',
      validated,
    );
    return data;
  }
}
