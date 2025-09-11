import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

interface AuthenticationSectionProps {
  isAuthenticated: boolean;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

export const AuthenticationSection = ({
  isAuthenticated,
  accessToken,
  loading,
  error,
  onLogin,
  onLogout,
}: AuthenticationSectionProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await onLogin(email, password);
  };

  if (isAuthenticated && accessToken) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Medplum Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Access token:</span>{" "}
            <code className="break-all">
              {accessToken.slice(0, 24)}…{accessToken.slice(-12)}
            </code>
          </p>
          <p className="text-sm font-medium">
            Token will be attached to "REST Api Call" Nodes on newly created
            RuleChains.
          </p>
          <Button variant="destructive" onClick={onLogout}>
            Logout
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Login to Medplum</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">
            {error}
          </p>
        )}

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
          <Button onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
          {process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID && (
            <span className="text-xs text-gray-500">
              Client ID:{" "}
              <code>{process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID}</code>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
