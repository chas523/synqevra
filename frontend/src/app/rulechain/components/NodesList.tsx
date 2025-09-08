import { useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from "sonner";
import { RuleNode, RuleChainMetadata } from "../[id]/actions";
import { FlowChartEditor } from "./FlowChartEditor";
import { FlowNode, FlowConnection } from "./NodeTypes";

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

  // Convert RuleChain nodes to Flow nodes
  const convertToFlowNodes = (ruleNodes: RuleNode[]): FlowNode[] => {
    return ruleNodes.map((node, index) => ({
      id: node.id.id,
      type: node.type,
      name: node.name,
      configuration: node.configuration,
      position: index,
    }));
  };

  // Convert RuleChain connections to Flow connections
  const convertToFlowConnections = (connections: any[]): FlowConnection[] => {
    return connections.map((conn) => ({
      fromIndex: conn.fromIndex,
      toIndex: conn.toIndex,
      type: conn.type,
    }));
  };

  // Convert Flow nodes back to RuleChain format
  const convertFromFlowNodes = (flowNodes: FlowNode[]): any[] => {
    return flowNodes.map((node, index) => {
      const baseNode = {
        createdTime: Date.now(), // Will be set by backend
        ruleChainId: metadata.ruleChainId,
        type: node.type,
        name: node.name,
        debugSettings: {
          failuresEnabled: false,
          allEnabled: false,
          allEnabledUntil: 0,
        },
        singletonMode: false,
        queueName: "Main",
        configurationVersion: 0,
        configuration: node.configuration,
        externalId: null,
        additionalInfo: {
          description: null,
          layoutX: index * 200 + 100, // Horizontal spacing
          layoutY: 200,
        },
      };

      // Only include id for existing nodes (not temporary ones)
      if (!node.id.startsWith("temp_")) {
        return {
          ...baseNode,
          id: { entityType: "RULE_NODE", id: node.id },
        };
      }

      return baseNode;
    });
  };

  const handleSave = async (
    flowNodes: FlowNode[],
    flowConnections: FlowConnection[]
  ) => {
    try {
      const updatedNodes = convertFromFlowNodes(flowNodes);
      const updatedConnections = flowConnections.map((conn) => ({
        fromIndex: conn.fromIndex,
        toIndex: conn.toIndex,
        type: conn.type,
      }));

      const updatedMetadata: RuleChainMetadata = {
        ...metadata,
        nodes: updatedNodes,
        connections: updatedConnections,
        version: metadataVersion, // Use the version from state
      };

      await onUpdateMetadata(updatedMetadata);
      toast.success("Rule chain metadata updated successfully");
    } catch (error) {
      toast.error("Failed to update rule chain metadata");
      console.error("Error updating metadata:", error);
      throw error; // Re-throw to be handled by FlowChartEditor
    }
  };

  const handleCancel = () => {
    // Reset version to original
    setMetadataVersion(metadata.version);
  };

  const flowNodes = convertToFlowNodes(nodes || []);
  const flowConnections = convertToFlowConnections(metadata.connections || []);

  return (
    <div className="border-t pt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Rule Chain Flow Editor</h3>

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
