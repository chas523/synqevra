import { useState } from "react";
import { useRouter } from "next/navigation";
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
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  return { login, isLoading, error, success };
}

export function useAdminLogin() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function login(loginForm: LoginFormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await AuthService.loginAdminRequest(loginForm);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setSuccess(false);
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

export function useLogout() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function logout() {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await AuthService.logoutRequest();
      setSuccess(true);
      router.push("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setLoading(false);
    }
  }

  return { logout, isLoading, error, success };
}

export function useAdminLogout() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function logout() {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await AuthService.logoutAdminRequest();
      setSuccess(true);
      router.push("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setLoading(false);
    }
  }

  return { logout, isLoading, error, success };
}

