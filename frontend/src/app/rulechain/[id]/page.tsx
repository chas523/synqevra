"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { RuleChainAdvancedView } from "../components/RuleChainAdvancedView";
import { RuleChainBasicView } from "../components/RuleChainBasicView";
import { RuleChainHeader } from "../components/RuleChainHeader";
import type {
  RuleChainDetails,
  RuleChainMetadata,
} from "../types/RuleChainTypes";
import {
  fetchRuleChainById,
  fetchRuleChainMetadata,
  updateRuleChain,
  updateRuleChainMetadata,
} from "./actions";

const RuleChainDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const ruleChainId = params.id as string;

  const [loading, setLoading] = useState<boolean>(true);
  const [ruleChain, setRuleChain] = useState<RuleChainDetails | null>(null);
  const [metadata, setMetadata] = useState<RuleChainMetadata | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  //basic form states
  const [basicName, setBasicName] = useState<string>("");
  const [basicDebugMode, setBasicDebugMode] = useState<boolean>(false);

  //advanced form state
  const [metadataJson, setMetadataJson] = useState<string>("");

  useEffect(() => {
    if (ruleChainId) {
      loadRuleChainData();
    }
  }, [ruleChainId]);

  const loadRuleChainData = async () => {
    try {
      setLoading(true);
      setError(null);

      const ruleChainResult = await fetchRuleChainById(ruleChainId);
      if (!ruleChainResult.success) {
        if ("error" in ruleChainResult) {
          setError(ruleChainResult.error || "Failed to load rule chain");
        }
        return;
      }

      if ("data" in ruleChainResult) {
        setRuleChain(ruleChainResult.data);
        setBasicName(ruleChainResult.data.name);
        setBasicDebugMode(ruleChainResult.data.debugMode);
      }

      const metadataResult = await fetchRuleChainMetadata(ruleChainId);
      if (!metadataResult.success) {
        if ("error" in metadataResult) {
          setError(
            metadataResult.error || "Failed to load rule chain metadata",
          );
          toast.error("Failed to load rule chain metadata");
        }
        return;
      }

      if ("data" in metadataResult) {
        setMetadata(metadataResult.data);
        setMetadataJson(JSON.stringify(metadataResult.data, null, 2));
      }

      toast.success("Rule chain data loaded successfully");
    } catch (err) {
      console.error("Failed to load rule chain data:", err);
      const errorMessage = "Failed to load rule chain data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicEdit = async () => {
    if (!ruleChain) return;

    try {
      setEditing(true);
      setError(null);

      //prepare firstRuleNodeId if there are nodes in metadata
      const firstRuleNodeId =
        metadata?.nodes?.length > 0 ? metadata.nodes[0].id : undefined;

      const updateData = {
        id: ruleChain.id,
        name: basicName,
        debugMode: basicDebugMode,
        additionalInfo: ruleChain.additionalInfo,
        ...(firstRuleNodeId && { firstRuleNodeId }),
      };

      const result = await updateRuleChain(ruleChainId, updateData);
      if (result.success) {
        if ("data" in result) {
          setRuleChain(result.data);
          //reload data
          await loadRuleChainData();
          toast.success("Rule chain updated successfully");
        }
      } else {
        if ("error" in result) {
          const errorMessage = result.error || "Failed to update rule chain";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } catch (err) {
      console.error("Failed to update rule chain:", err);
      const errorMessage = "Failed to update rule chain";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setEditing(false);
    }
  };

  const handleAdvancedEdit = async () => {
    try {
      setEditing(true);
      setError(null);

      const parsedMetadata: RuleChainMetadata = JSON.parse(metadataJson);

      const result = await updateRuleChainMetadata(parsedMetadata);
      if (result.success) {
        if ("data" in result) {
          setMetadata(result.data);
          setMetadataJson(JSON.stringify(result.data, null, 2));
          //reload basic data as well in case it changed
          await loadRuleChainData();
          toast.success("Rule chain metadata updated successfully");
        }
      } else {
        if ("error" in result) {
          const errorMessage =
            result.error || "Failed to update rule chain metadata";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } catch (err) {
      console.error("Failed to update rule chain metadata:", err);
      let errorMessage = "Failed to update rule chain metadata";
      if (err instanceof SyntaxError) {
        errorMessage = "Invalid JSON format";
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setEditing(false);
    }
  };

  const handleUpdateMetadata = async (updatedMetadata: RuleChainMetadata) => {
    try {
      setEditing(true);
      setError(null);
      console.log(updatedMetadata);
      const result = await updateRuleChainMetadata(updatedMetadata);
      if (result.success) {
        if ("data" in result) {
          //validate and fix result data if needed
          const validatedData = {
            ...result.data,
            firstNodeIndex:
              result.data.nodes.length > 0
                ? Math.max(
                    0,
                    Math.min(
                      result.data.firstNodeIndex || 0,
                      result.data.nodes.length - 1,
                    ),
                  )
                : null,
          };

          setMetadata(validatedData);
          setMetadataJson(JSON.stringify(validatedData, null, 2));

          //reload basic data as well in case it changed
          await loadRuleChainData();
          toast.success("Rule chain metadata updated via flow editor");
        }
      } else {
        if ("error" in result) {
          const errorMessage =
            result.error || "Failed to update rule chain metadata";
          setError(errorMessage);
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      }
    } catch (err) {
      console.error("Failed to update rule chain metadata:", err);
      const errorMessage = "Failed to update rule chain metadata";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Loading RuleChain Details...
          </h2>
        </div>
      </div>
    );
  }

  if (!ruleChain) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">
            RuleChain not found
          </h2>
          <Button onClick={() => router.push("/rulechain")} className="mt-4">
            Back to RuleChains
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <RuleChainHeader
        name={ruleChain.name}
        onBack={() => router.push("/rulechain")}
      />

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <RuleChainBasicView
            ruleChain={ruleChain}
            metadata={metadata}
            basicName={basicName}
            basicDebugMode={basicDebugMode}
            editing={editing}
            onNameChange={setBasicName}
            onDebugModeChange={setBasicDebugMode}
            onEdit={handleBasicEdit}
            onUpdateMetadata={handleUpdateMetadata}
          />
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <RuleChainAdvancedView
            metadataJson={metadataJson}
            editing={editing}
            onMetadataChange={setMetadataJson}
            onEdit={handleAdvancedEdit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RuleChainDetailsPage;
