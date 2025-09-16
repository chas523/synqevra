import { Card, CardContent } from "../../../components/ui/card";
import type { RuleChain } from "../types/RuleChainTypes";

interface RuleChainListProps {
  ruleChains: RuleChain[];
  loading: boolean;
  onRuleChainClick: (ruleChain: RuleChain) => void;
}

export const RuleChainList = ({
  ruleChains,
  loading,
  onRuleChainClick,
}: RuleChainListProps) => {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Loading RuleChains…</p>
        </CardContent>
      </Card>
    );
  }

  if (ruleChains.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 text-lg">No rule chains found.</p>
          <p className="text-gray-400 mt-2">
            Create your first rule chain below
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Type</th>
                <th className="p-4 text-left font-semibold">Debug Mode</th>
                <th className="p-4 text-left font-semibold">Created Time</th>
              </tr>
            </thead>
            <tbody>
              {ruleChains.map((ruleChain, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onRuleChainClick(ruleChain)}
                >
                  <td className="p-4 font-medium text-blue-600 hover:text-blue-800">
                    {ruleChain.name || "Not specified"}
                  </td>
                  <td className="p-4">{ruleChain.type || "Not specified"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ruleChain.debugMode
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ruleChain.debugMode ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatDate(ruleChain.createdTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
