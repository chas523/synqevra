import { useState } from "react";
import { AuthService } from "@/lib/services/authServices/authService";
import type { LoginFormData, RegisterFormData } from "@/types/authTypes";

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

export function useRegister() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function register(registerForm: RegisterFormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await AuthService.registerRequest(registerForm);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return { register, isLoading, error, success };
}
