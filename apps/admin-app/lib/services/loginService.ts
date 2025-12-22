import { proxyApi } from "@/api/api";
import type { LoginFormData } from "../types/loginTypes";

export class AuthService {
  public static async loginRequest(formData: LoginFormData): Promise<void> {
    try {
      await proxyApi.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      //localStorage.setItem("isAuthenticated", "true");
    } catch (err: unknown) {
      const e = err as any;
      const message =
        e?.response?.data?.message ?? e?.message ?? "Authentication failed";
      throw new Error(message);
    }
  }

  public static async logoutRequest(): Promise<void> {
    try {
      await proxyApi.post("/auth/logout");
      //localStorage.removeItem("isAuthenticated");
    } catch (err: unknown) {
      const e = err as any;
      const message =
        e?.response?.data?.message ?? e?.message ?? "Logout failed";
      throw new Error(message);
    }
  }
}
