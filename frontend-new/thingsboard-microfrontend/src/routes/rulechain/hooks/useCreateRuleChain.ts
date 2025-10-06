import { useState } from 'react';
import { mutate } from 'swr';
import { RuleChainService } from '../services/ruleChainService';
import type { CreateRuleChainRequest } from '../types/RuleChainTypes';

export function useCreateRulechain() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createFromJson(json: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const parsed: CreateRuleChainRequest = JSON.parse(json);
      await RuleChainService.createRuleChain(parsed);
      // Revalidate the list of rulechains so UI shows the newly created item
      // We call mutate with the same key used in useRulechains()
      // This will trigger a refetch of RuleChainService.fetchRuleChains
      mutate('rulechains');
      return true;
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format');
      } else {
        setError(
          err instanceof Error ? err.message : 'Failed to create rulechain',
        );
      }
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { createFromJson, isLoading, error };
}
