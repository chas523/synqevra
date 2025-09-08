import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { FlowNode } from "./NodeTypes";

interface NodeConfigurationEditorProps {
  node: FlowNode;
  onSave: (nodeId: string, configuration: any, name: string) => void;
  onCancel: () => void;
}

export const NodeConfigurationEditor = ({
  node,
  onSave,
  onCancel,
}: NodeConfigurationEditorProps) => {
  const [nodeName, setNodeName] = useState(node.name);
  const [config, setConfig] = useState(node.configuration);

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNestedConfigChange = (
    parentKey: string,
    key: string,
    value: any
  ) => {
    setConfig((prev: any) => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(node.id, config, nodeName);
  };

  const renderConfigField = (key: string, value: any, parentKey?: string) => {
    const fieldKey = parentKey ? `${parentKey}.${key}` : key;

    if (typeof value === "boolean") {
      return (
        <div key={fieldKey} className="space-y-2">
          <Label htmlFor={fieldKey}>{key}</Label>
          <div className="flex items-center space-x-2">
            <input
              id={fieldKey}
              type="checkbox"
              checked={value}
              onChange={(e) => {
                if (parentKey) {
                  handleNestedConfigChange(parentKey, key, e.target.checked);
                } else {
                  handleConfigChange(key, e.target.checked);
                }
              }}
              className="rounded border-gray-300"
            />
            <span className="text-sm">{value ? "Enabled" : "Disabled"}</span>
          </div>
        </div>
      );
    }

    if (typeof value === "number") {
      return (
        <div key={fieldKey} className="space-y-2">
          <Label htmlFor={fieldKey}>{key}</Label>
          <Input
            id={fieldKey}
            type="number"
            value={value || ""}
            onChange={(e) => {
              const numValue = e.target.value ? parseInt(e.target.value) : null;
              if (parentKey) {
                handleNestedConfigChange(parentKey, key, numValue);
              } else {
                handleConfigChange(key, numValue);
              }
            }}
          />
        </div>
      );
    }

    if (typeof value === "string") {
      // Multi-line fields (JavaScript code)
      if (key.includes("Script") || key.includes("script")) {
        return (
          <div key={fieldKey} className="space-y-2">
            <Label htmlFor={fieldKey}>{key}</Label>
            <Textarea
              id={fieldKey}
              value={value || ""}
              onChange={(e) => {
                if (parentKey) {
                  handleNestedConfigChange(parentKey, key, e.target.value);
                } else {
                  handleConfigChange(key, e.target.value);
                }
              }}
              className="min-h-[100px] font-mono text-sm"
              placeholder={`Enter ${key}`}
            />
          </div>
        );
      }

      // Single-line fields
      return (
        <div key={fieldKey} className="space-y-2">
          <Label htmlFor={fieldKey}>{key}</Label>
          <Input
            id={fieldKey}
            value={value || ""}
            onChange={(e) => {
              if (parentKey) {
                handleNestedConfigChange(parentKey, key, e.target.value);
              } else {
                handleConfigChange(key, e.target.value);
              }
            }}
            placeholder={`Enter ${key}`}
          />
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div
          key={fieldKey}
          className="space-y-4 border-l-4 border-gray-200 pl-4"
        >
          <h4 className="font-medium text-gray-700">{key}</h4>
          {Object.entries(value).map(([subKey, subValue]) =>
            renderConfigField(subKey, subValue, key)
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Configure Node: {node.type.split(".").pop()}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Node Name */}
        <div className="space-y-2">
          <Label htmlFor="node-name">Node Name</Label>
          <Input
            id="node-name"
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            placeholder="Enter node name"
          />
        </div>

        {/* Configuration Fields */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold">Configuration</h3>
          {Object.entries(config).map(([key, value]) =>
            renderConfigField(key, value)
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t">
          <Button onClick={handleSave} className="flex-1">
            Save Configuration
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
