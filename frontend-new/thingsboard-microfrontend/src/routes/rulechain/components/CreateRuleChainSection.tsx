import { type ChangeEvent, useId, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { useCreateRulechain } from '../hooks/useCreateRuleChain';

const DEFAULT_JSON = `{
  "name": "New RuleChain",
  "type": "CORE",
  "debugMode": true
}`;

export const CreateRuleChainSection = () => {
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON);
  const { createFromJson, isLoading, error } = useCreateRulechain();
  const jsonEditorId = useId();

  const handleCreate = async () => {
    const success = await createFromJson(jsonInput);
    if (success) {
      setJsonInput(DEFAULT_JSON);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New RuleChain</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={jsonEditorId} className="mb-3 block">
            RuleChain Configuration (JSON)
          </Label>
          <Textarea
            id={jsonEditorId}
            value={jsonInput}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setJsonInput(e.target.value)
            }
            placeholder="Enter RuleChain JSON configuration"
            className="min-h-[200px] font-mono text-sm"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <Button
          onClick={handleCreate}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Creating...' : 'Create'}
        </Button>
      </CardContent>
    </Card>
  );
};
