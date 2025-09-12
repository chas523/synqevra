import { useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from "sonner";
import { RuleNode, RuleChainMetadata } from "../[id]/actions";
import { FlowChartEditor } from "./FlowChartEditor";
import { FlowNode, FlowConnection } from "../types/NodeTypes";
import { defaultRuleChainTemplate } from "./defaultRuleChainTemplate";

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

  //convert RuleChain nodes to Flow nodes
  const convertToFlowNodes = (ruleNodes: RuleNode[]): FlowNode[] => {
    return ruleNodes.map((node, index) => ({
      id: node.id.id,
      type: node.type,
      name: node.name,
      configuration: node.configuration,
      position: index,
    }));
  };

  //convert RuleChain connections to Flow connections
  const convertToFlowConnections = (connections: any[]): FlowConnection[] => {
    return connections.map((conn) => ({
      fromIndex: conn.fromIndex,
      toIndex: conn.toIndex,
      type: conn.type,
    }));
  };

  //convert Flow nodes back to RuleChain format
  const convertFromFlowNodes = (flowNodes: FlowNode[]): any[] => {
    return flowNodes.map((node, index) => {
      const baseNode = {
        createdTime: Date.now(), //will be set by backend
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
          layoutX: index * 200 + 100,
          layoutY: 200,
        },
      };

      //only include id for existing nodes (not temporary ones)
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

      //set firstNodeIndex to 0 if there are nodes, otherwise null
      const firstNodeIndex = updatedNodes.length > 0 ? 0 : null;

      //validate connections when no nodes exist
      const validConnections =
        updatedNodes.length > 0 ? updatedConnections : [];

      const updatedMetadata: RuleChainMetadata = {
        ...metadata,
        nodes: updatedNodes,
        connections: validConnections,
        firstNodeIndex, //always set to first node
        version: metadataVersion, //use the version from state
      };

      await onUpdateMetadata(updatedMetadata);
      toast.success("Rule chain metadata updated successfully");
    } catch (error) {
      toast.error("Failed to update rule chain metadata");
      console.error("Error updating metadata:", error);
      throw error; //re-throw to be handled by FlowChartEditor
    }
  };

  const handleCancel = () => {
    setMetadataVersion(metadata.version);
  };

  const handleLoadDefaultTemplate = async () => {
    try {
      //create metadata with default template
      const defaultMetadata: RuleChainMetadata = {
        ...metadata,
        nodes: defaultRuleChainTemplate.nodes as any[], //api is gonna generate IDs
        connections: defaultRuleChainTemplate.connections,
        firstNodeIndex: defaultRuleChainTemplate.firstNodeIndex,
        version: metadataVersion,
      };
      console.log(defaultMetadata);

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
