import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { CreateRuleChainRequest } from "../types/RuleChainTypes";

interface CreateRuleChainSectionProps {
  creating: boolean;
  onCreateRuleChain: (data: CreateRuleChainRequest) => Promise<void>;
}

const DEFAULT_JSON = `{
  "name": "New RuleChain",
  "type": "CORE",
  "debugMode": true
}`;

export const CreateRuleChainSection = ({
  creating,
  onCreateRuleChain,
}: CreateRuleChainSectionProps) => {
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON);

  const handleCreate = async () => {
    try {
      const ruleChainData: CreateRuleChainRequest = JSON.parse(jsonInput);
      await onCreateRuleChain(ruleChainData);
      setJsonInput(DEFAULT_JSON);
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error("Invalid JSON format");
      }
      throw err;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New RuleChain</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="json-editor" className="mb-3 block">
            RuleChain Configuration (JSON)
          </Label>
          <Textarea
            id="json-editor"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Enter RuleChain JSON configuration"
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
        <Button
          onClick={handleCreate}
          disabled={creating}
          className="w-full sm:w-auto"
        >
          {creating ? "Creating..." : "Create"}
        </Button>
      </CardContent>
    </Card>
  );
};
