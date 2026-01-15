import { proxyApi } from "@/lib/api/api";
import { extractErrorMessage } from "@/lib/utils";
import type {
  LoginFormData,
  RegisterFormData,
  RegisterResponse,
} from "@/types/authTypes";

export class AuthService {
  public static async loginRequest(formData: LoginFormData): Promise<void> {
    try {
      await proxyApi.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("isAuthenticated", "true");
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Authentication failed");
      throw new Error(message);
    }
  }

  public static async loginAdminRequest(formData: LoginFormData): Promise<void> {
    try {
      await proxyApi.post("/admin/login", {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("isAuthenticatedAdmin", "true");
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Authentication failed");
      throw new Error(message);
    }
  }

  public static async registerRequest(
    formData: RegisterFormData,
  ): Promise<RegisterResponse> {
    try {
      const { data } = await proxyApi.post<RegisterResponse>("/auth/register", {
        firstName: formData.name,
        lastName: formData.surname,
        email: formData.email,
        password: formData.password,
      });
      return data;
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Registration failed");
      throw new Error(message);
    }
  }

  public static async logoutRequest(): Promise<void> {
    try {
      await proxyApi.post("/auth/logout");
      localStorage.removeItem("isAuthenticated");
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Logout failed");
      throw new Error(message);
    }
  }

  public static async logoutAdminRequest(): Promise<void> {
    try {
      await proxyApi.post("/admin/logout");
      localStorage.removeItem("isAuthenticatedAdmin");
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Logout failed");
      throw new Error(message);
    }
  }
}
