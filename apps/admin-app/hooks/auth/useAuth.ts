import { useState } from "react";
import type { LoginFormData } from "@/lib/types/loginTypes";
import { AuthService } from "../../lib/services/loginService";

export function useLogin() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function login(loginForm: LoginFormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await AuthService.loginRequest(loginForm);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return { login, isLoading, error, success };
}
