import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import type { FlowConnection, FlowNode } from "../types/NodeTypes";
import type { RuleChainMetadata, RuleNode } from "../types/RuleChainTypes";
import {
  convertFromFlowNodes,
  convertToFlowConnections,
  convertToFlowNodes,
  createUpdatedMetadata,
} from "../utils";
import { getDefaultRuleChainTemplate } from "./defaultRuleChainTemplate";
import { FlowChartEditor } from "./FlowChartEditor";

interface NodesListProps {
  nodes: RuleNode[];
  metadata: RuleChainMetadata;
  onUpdateMetadata: (metadata: RuleChainMetadata) => void;
}

export const NodesList = ({
  nodes,
  metadata,
  onUpdateMetadata,
}: NodesListProps) => {
  const [metadataVersion, setMetadataVersion] = useState(metadata.version);

  const handleSave = async (
    flowNodes: FlowNode[],
    flowConnections: FlowConnection[],
  ) => {
    try {
      const updatedNodes = convertFromFlowNodes(
        flowNodes,
        metadata.ruleChainId,
      );
      const updatedMetadata = createUpdatedMetadata(
        metadata,
        updatedNodes,
        flowConnections,
        metadataVersion,
      );

      await onUpdateMetadata(updatedMetadata);
      toast.success("Rule chain metadata updated successfully");
    } catch (error) {
      toast.error("Failed to update rule chain metadata");
      console.error("Error updating metadata:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    setMetadataVersion(metadata.version);
  };

  const handleLoadDefaultTemplate = async () => {
    try {
      const template = getDefaultRuleChainTemplate();
      const defaultMetadata = createUpdatedMetadata(
        metadata,
        template.nodes as any[],
        template.connections as FlowConnection[],
        metadataVersion,
      );

      await onUpdateMetadata(defaultMetadata);
      setMetadataVersion(metadataVersion + 1);
      toast.success("Default RuleChain template loaded successfully");
    } catch (error) {
      toast.error("Failed to load default template");
      console.error("Error loading default template:", error);
    }
  };

  const flowNodes = convertToFlowNodes(nodes || []);
  const flowConnections = convertToFlowConnections(metadata.connections || []);

  return (
    <div className="border-t pt-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Rule Chain Flow Editor</h3>
          <Button
            onClick={handleLoadDefaultTemplate}
            variant="outline"
            size="sm"
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          >
            Create Default RuleChain
          </Button>
        </div>

        {/* Version Control */}
        <div className="flex items-center space-x-2">
          <Label htmlFor="version" className="text-sm">
            Version:
          </Label>
          <Input
            id="version"
            type="number"
            value={metadataVersion}
            onChange={(e) =>
              setMetadataVersion(parseInt(e.target.value) || metadata.version)
            }
            className="w-20"
            min={metadata.version}
          />
        </div>
      </div>

      <FlowChartEditor
        initialNodes={flowNodes}
        initialConnections={flowConnections}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};
