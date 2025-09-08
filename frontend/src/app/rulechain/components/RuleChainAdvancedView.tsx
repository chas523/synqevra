import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";

interface RuleChainAdvancedViewProps {
  metadataJson: string;
  editing: boolean;
  onMetadataChange: (metadata: string) => void;
  onEdit: () => void;
}

export const RuleChainAdvancedView = ({
  metadataJson,
  editing,
  onMetadataChange,
  onEdit,
}: RuleChainAdvancedViewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Metadata Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="metadata-editor" className="mb-2 block">
            Metadata JSON Configuration
          </Label>
          <Textarea
            id="metadata-editor"
            value={metadataJson}
            onChange={(e) => onMetadataChange(e.target.value)}
            placeholder="Enter metadata JSON configuration"
            className="min-h-[400px] font-mono text-sm"
          />
        </div>

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
