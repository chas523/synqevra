import { Card, CardContent } from "../../../components/ui/card";
import { RuleChainMetadata } from "../[id]/actions";

interface MetadataSummaryProps {
  metadata: RuleChainMetadata;
}

export const MetadataSummary = ({ metadata }: MetadataSummaryProps) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Metadata Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metadata.nodes?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Nodes</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {metadata.connections?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Connections</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              v{metadata.version}
            </div>
            <div className="text-sm text-gray-600">Version</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
