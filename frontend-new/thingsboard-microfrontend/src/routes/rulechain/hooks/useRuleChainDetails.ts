import useSWR from 'swr';
import { RuleChainService } from '../services/ruleChainService';
import type {
  EntityId,
  RuleChainDetails,
  UpdateRuleChainRequest,
} from '../types/RuleChainTypes';

export function useRulechainDetails(ruleChainId: string) {
  const { data, error, isLoading, mutate } = useSWR<RuleChainDetails>(
    ruleChainId ? `rulechain/${ruleChainId}` : null,
    (_key: string) =>
      RuleChainService.fetchRuleChain(ruleChainId) as Promise<RuleChainDetails>,
  );

  async function update(updateData: UpdateRuleChainRequest & { id: EntityId }) {
    const updated = await RuleChainService.updateRuleChain(
      ruleChainId,
      updateData,
    );
    await mutate();
    return updated;
  }

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
    update,
  };
}
