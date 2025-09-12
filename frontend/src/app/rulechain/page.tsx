"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RuleChain,
  fetchRuleChains,
  createRuleChain,
  CreateRuleChainRequest,
} from "./actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";

const RuleChainEditor = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [ruleChains, setRuleChains] = useState<RuleChain[]>([]);
  const [creating, setCreating] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>(`{
  "name": "New RuleChain",
  "type": "CORE",
  "debugMode": true
}`);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRuleChains();
  }, []);

  const loadRuleChains = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchRuleChains();
      if (result.success) {
        setRuleChains(result.data.data || []);
      } else {
        setError(result.error || "Failed to load rule chains");
      }
    } catch (err) {
      console.error("Failed to load rule chains:", err);
      setError("Failed to load rule chains");
    } finally {
      setLoading(false);
    }
  };

  const  = async () => {
    try {
      setCreating(true);
      setError(null);

      //parse JSON input
      const ruleChainData: CreateRuleChainRequest = JSON.parse(jsonInput);

      const result = await createRuleChain(ruleChainData);
      if (result.success) {
        //reload rule chains after successful creation
        await loadRuleChains();
        setJsonInput(`{
        "name": "New RuleChain",
        "type": "CORE",
        "debugMode": true
        }`);
      } else {
        setError(result.error || "Failed to create rule chain");
      }
    } catch (err) {
      console.error("Failed to create rule chain:", err);
      if (err instanceof SyntaxError) {
        setError("Invalid JSON format");
      } else {
        setError("Failed to create rule chain");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRuleChainClick = (ruleChain: RuleChain) => {
    if (ruleChain.id?.id) {
      router.push(`/rulechain/${ruleChain.id.id}`);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Loading RuleChains...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RuleChains</h1>
        <p className="text-gray-600">Manage thingsboard rule chains</p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* RuleChains Table */}
      <div className="mb-8">
        <h2 className="font-bold mb-6 text-xl">Existing RuleChains</h2>
        {ruleChains.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 text-lg">No rule chains found.</p>
              <p className="text-gray-400 mt-2">
                Create your first rule chain below
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-4 text-left font-semibold">Name</th>
                      <th className="p-4 text-left font-semibold">Type</th>
                      <th className="p-4 text-left font-semibold">
                        Debug Mode
                      </th>
                      <th className="p-4 text-left font-semibold">
                        Created Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ruleChains.map((ruleChain, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleRuleChainClick(ruleChain)}
                      >
                        <td className="p-4 font-medium text-blue-600 hover:text-blue-800">
                          {ruleChain.name || "Not specified"}
                        </td>
                        <td className="p-4">
                          {ruleChain.type || "Not specified"}
                        </td>
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
        )}
      </div>

      {/* Create New RuleChain */}
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
            onClick={handleCreateRuleChain}
            disabled={creating}
            className="w-full sm:w-auto"
          >
            {creating ? "Creating..." : "Create"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RuleChainEditor;
