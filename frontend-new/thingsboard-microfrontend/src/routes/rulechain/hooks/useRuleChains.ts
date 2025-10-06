import useSWR from 'swr';
import { RuleChainService } from '../services/ruleChainService';
import type { RuleChain } from '../types/RuleChainTypes';

export function useRulechains() {
  const { data, error, isLoading, mutate } = useSWR<RuleChain[]>(
    'rulechains',
    RuleChainService.fetchRuleChains,
  );
  return { ruleChains: data || [], error, isLoading, refresh: mutate };
}
