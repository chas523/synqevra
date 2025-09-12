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
import { Input } from "../../components/ui/input";
import { medplum } from "@/lib/medplum";
import { MedplumClient } from "@medplum/core";

const RuleChainEditor = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
    const tok = medplum.getAccessToken();
    if (tok) setAccessToken(tok);
  }, [medplum]);

  const handleLogin = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      const login = await medplum.startLogin({
        email,
        password,
        remember: false,

        scope: "openid offline_access",
      });

      await medplum.processCode(login.code);

      const tok = medplum.getAccessToken();
      setAccessToken(tok ?? null);
    } catch (e: any) {
      console.error(e);
      setAuthError(e?.message ?? "Login error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await medplum.signOut();
    setAccessToken(null);
  };

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

  const handleCreateRuleChain = async () => {
    try {
      setCreating(true);
      setError(null);
      const ruleChainData: CreateRuleChainRequest = JSON.parse(jsonInput);
      const result = await createRuleChain(ruleChainData);
      if (result.success) {
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
      if (err instanceof SyntaxError) setError("Invalid JSON format");
      else setError("Failed to create rule chain");
    } finally {
      setCreating(false);
    }
  };

  const handleRuleChainClick = (ruleChain: RuleChain) => {
    if (ruleChain.id?.id) router.push(`/rulechain/${ruleChain.id.id}`);
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Login to Medplum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {authError && (
            <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">
              {authError}
            </p>
          )}

          {!accessToken ? (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="mb-3">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="mb-3">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <Button onClick={handleLogin} disabled={authLoading}>
                  {authLoading ? "Logging in..." : "Login"}
                </Button>
                {process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID ? (
                  <span className="text-xs text-gray-500">
                    Client ID:{" "}
                    <code>{process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID}</code>
                  </span>
                ) : null}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Access token:</span>{" "}
                <code className="break-all">
                  {accessToken.slice(0, 24)}…{accessToken.slice(-12)}
                </code>
              </p>
              <p className="text-sm font-medium">
                It'll be attached to "REST Api Call" Nodes on newly created
                RuleChains.
              </p>
              <div className="flex gap-3">
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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

      <div className="mb-8">
        <h2 className="font-bold mb-6 text-xl">Existing RuleChains</h2>
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Loading RuleChains…</p>
            </CardContent>
          </Card>
        ) : ruleChains.length === 0 ? (
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
