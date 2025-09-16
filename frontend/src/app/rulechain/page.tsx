"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { createRuleChain, fetchRuleChains } from "./actions";
import { AuthenticationSection } from "./components/AuthenticationSection";
import { CreateRuleChainSection } from "./components/CreateRuleChainSection";
import { RuleChainList } from "./components/RuleChainList";
import { useAuth } from "./hooks/useAuth";
import type { CreateRuleChainRequest, RuleChain } from "./types/RuleChainTypes";

const RuleChainEditor = () => {
  const router = useRouter();
  const {
    isAuthenticated,
    accessToken,
    loading: authLoading,
    error: authError,
    login,
    logout,
  } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [ruleChains, setRuleChains] = useState<RuleChain[]>([]);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRuleChains();
  }, []);

  const loadRuleChains = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchRuleChains();
      if (result.success) {
        if ("data" in result) {
          setRuleChains(result.data.data || []);
        }
      } else {
        if ("error" in result) {
          setError(result.error || "Failed to load rule chains");
        }
      }
    } catch (err) {
      console.error("Failed to load rule chains:", err);
      setError("Failed to load rule chains");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRuleChain = async (
    ruleChainData: CreateRuleChainRequest,
  ) => {
    try {
      setCreating(true);
      setError(null);
      const result = await createRuleChain(ruleChainData);
      if (result.success) {
        await loadRuleChains();
      } else {
        if ("error" in result) {
          setError(result.error || "Failed to create rule chain");
        }
      }
    } catch (err) {
      console.error("Failed to create rule chain:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create rule chain",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleRuleChainClick = (ruleChain: RuleChain) => {
    if (ruleChain.id?.id) {
      router.push(`/rulechain/${ruleChain.id.id}`);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Checking authentication...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <AuthenticationSection
        isAuthenticated={isAuthenticated}
        accessToken={accessToken}
        loading={authLoading}
        error={authError}
        onLogin={login}
        onLogout={logout}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RuleChains</h1>
        <p className="text-gray-600">Manage thingsboard rule chains</p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="mb-8">
        <h2 className="font-bold mb-6 text-xl">Existing RuleChains</h2>
        <RuleChainList
          ruleChains={ruleChains}
          loading={loading}
          onRuleChainClick={handleRuleChainClick}
        />
      </div>

      <CreateRuleChainSection
        creating={creating}
        onCreateRuleChain={handleCreateRuleChain}
      />
    </div>
  );
};

export default RuleChainEditor;
