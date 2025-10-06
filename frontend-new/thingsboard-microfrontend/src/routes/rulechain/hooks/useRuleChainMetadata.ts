import useSWR from 'swr';
import { RuleChainService } from '../services/ruleChainService';
import type { RuleChainMetadata } from '../types/RuleChainTypes';

export function useRulechainMetadata(ruleChainId: string) {
  const {
    data: metadata,
    error,
    isLoading,
    mutate,
  } = useSWR<RuleChainMetadata>(
    ruleChainId ? `rulechain/${ruleChainId}/metadata` : null,
    () => RuleChainService.fetchRuleChainMetadata(ruleChainId),
  );

  async function update(newMetadata: RuleChainMetadata) {
    try {
      const updated =
        await RuleChainService.updateRuleChainMetadata(newMetadata);
      await mutate(updated, false);
      return true;
    } catch (err) {
      console.error('Failed to update metadata', err);
      return false;
    }
  }

  return {
    metadata,
    error,
    isLoading,
    update,
    refresh: mutate,
  };
}
