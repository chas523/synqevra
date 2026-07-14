"use client";

import useSWR from "swr";
import { useState } from "react";
import {
  RuleChainService,
  CreateRuleChainRequest,
  RuleChainsResponse,
} from "@/lib/services/thingsboardServices/ruleChainService";

export const useRuleChains = (
  page: number = 0,
  pageSize: number = 10,
  sortProperty: string = "createdTime",
  sortOrder: "ASC" | "DESC" = "DESC",
  type: string = "CORE",
) => {
  const key = ["rulechains", page, pageSize, sortProperty, sortOrder, type];

  const { data, error, isLoading, mutate } = useSWR<RuleChainsResponse>(
    key,
    () =>
      RuleChainService.fetchRuleChains(
        page,
        pageSize,
        sortProperty,
        sortOrder,
        type,
      ),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    ruleChains: data?.data ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    error,
    mutate,
  };
};

export const useManageRuleChain = () => {
  const [isSaving, setIsSaving] = useState(false);

  const createRuleChain = async (payload: CreateRuleChainRequest) => {
    setIsSaving(true);
    try {
      const result = await RuleChainService.createRuleChain(payload);
      return result;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRuleChain = async (id: string) => {
    try {
      await RuleChainService.deleteRuleChain(id);
    } catch (error) {
      throw error;
    }
  };

  const setRootRuleChain = async (id: string) => {
    try {
      const result = await RuleChainService.setRootRuleChain(id);
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    isSaving,
    createRuleChain,
    deleteRuleChain,
    setRootRuleChain,
  };
};

export const useSaveRuleChainMetadata = () => {
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);

  const saveMetadata = async (
    ruleChainId: string,
    nodes: any[],
    connections: any[],
    firstNodeIndex?: number,
  ) => {
    setIsSavingMetadata(true);
    try {
      await RuleChainService.saveRuleChainMetadata({
        ruleChainId: { entityType: "RULE_CHAIN", id: ruleChainId },
        nodes,
        connections,
        firstNodeIndex,
      });
    } finally {
      setIsSavingMetadata(false);
    }
  };

  return { saveMetadata, isSavingMetadata };
};

export const useRuleChainDetails = (id?: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["ruleChainDetails", id] : null,
    async () => {
      const [ruleChain, metadata] = await Promise.all([
        RuleChainService.getRuleChain(id!),
        RuleChainService.getRuleChainMetadata(id!),
      ]);
      return { ruleChain, metadata };
    },
    { revalidateOnFocus: false },
  );

  return {
    ruleChain: data?.ruleChain,
    metadata: data?.metadata,
    isLoading,
    error,
    mutate,
  };
};
