import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { RuleChainDetails, RuleChainMetadata } from "../[id]/actions";
import { MetadataSummary } from "./MetadataSummary";
import { NodesList } from "./NodesList";

interface RuleChainBasicViewProps {
  ruleChain: RuleChainDetails;
  metadata: RuleChainMetadata | null;
  basicName: string;
  basicDebugMode: boolean;
  editing: boolean;
  onNameChange: (name: string) => void;
  onDebugModeChange: (debugMode: boolean) => void;
  onEdit: () => void;
  onUpdateMetadata: (metadata: RuleChainMetadata) => void;
}

export const RuleChainBasicView = ({
  ruleChain,
  metadata,
  basicName,
  basicDebugMode,
  editing,
  onNameChange,
  onDebugModeChange,
  onEdit,
  onUpdateMetadata,
}: RuleChainBasicViewProps) => {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rule Chain Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="basic-name" className="mb-2 block">
              Name
            </Label>
            <Input
              id="basic-name"
              value={basicName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="RuleChain name"
            />
          </div>

          <div>
            <Label htmlFor="basic-type" className="mb-2 block">
              Type
            </Label>
            <Input
              id="basic-type"
              value={ruleChain.type}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="basic-debug" className="mb-2 block">
              Debug Mode
            </Label>
            <div className="flex items-center space-x-2">
              <input
                id="basic-debug"
                type="checkbox"
                checked={basicDebugMode}
                onChange={(e) => onDebugModeChange(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">
                {basicDebugMode ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="basic-created" className="mb-2 block">
              Created Time
            </Label>
            <Input
              id="basic-created"
              value={formatDate(ruleChain.createdTime)}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>

        {/* Metadata Summary */}
        {metadata && <MetadataSummary metadata={metadata} />}

        {/* Node List */}
        {metadata && (
          <NodesList
            nodes={metadata.nodes || []}
            metadata={metadata}
            onUpdateMetadata={onUpdateMetadata}
          />
        )}

        <Button
          onClick={onEdit}
          disabled={editing}
          className="w-full sm:w-auto"
        >
          {editing ? "Updating..." : "Edit"}
        </Button>
      </CardContent>
    </Card>
  );
};
