"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction} from "@/app/(auth)/login/actions";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState(searchParams?.get("error") || "");
  const [isLoading, setIsLoading] = useState(false);
  const next = searchParams?.get("next") || "/dashboard";

  async function login(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      await loginAction(formData)

    } catch (error) {
      setError("Login error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <div className="min-h-screen grid place-items-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <form onSubmit={login} className="grid gap-4">
              <input type="hidden" name="next" value={next} />

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                />
              </div>

              <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}
