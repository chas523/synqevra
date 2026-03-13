import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/authServices/authService";
import type { LoginFormData, RegisterFormData } from "@/types/authTypes";

export function useLogin() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function login(loginForm: LoginFormData, role: string) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (role === "ADMIN") {
        await AuthService.loginAdminRequest(loginForm);
      } else {
        await AuthService.loginRequest(loginForm);
      }
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

  async function logout(role: string) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (role === "ADMIN") {
        await AuthService.logoutAdminRequest();
        router.push("/auth/login/admin");
      } else {
        await AuthService.logoutRequest();
        router.push("/auth/login");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setLoading(false);
    }
  }

  return { logout, isLoading, error, success };
}

// export function useAdminLogout() {
//   const [isLoading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);
//   const router = useRouter();

//   async function logout() {
//     setLoading(true);
//     setError(null);
//     setSuccess(false);

//     try {
//       await AuthService.logoutAdminRequest();
//       setSuccess(true);
//       router.push("/auth/login/admin");
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Logout failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return { logout, isLoading, error, success };
// }
