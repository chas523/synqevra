import { proxyApi } from '@/api/api';
import type {
  LoginFormData,
  RegisterFormData,
  RegisterResponse,
} from '../types';

export class AuthService {
  public static async loginRequest(formData: LoginFormData): Promise<void> {
    try {
      await proxyApi.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('isAuthenticated', 'true');
    } catch (err: unknown) {
      const e = err as any;
      const message =
        e?.response?.data?.message ?? e?.message ?? 'Authentication failed';
      throw new Error(message);
    }
  }

  public static async registerRequest(
    formData: RegisterFormData,
  ): Promise<RegisterResponse> {
    try {
      const { data } = await proxyApi.post<RegisterResponse>(
        '/api/auth/register',
        {
          firstName: formData.name,
          lastName: formData.surname,
          email: formData.email,
          password: formData.password,
        },
      );
      return data;
    } catch (err: unknown) {
      const e = err as any;
      const message =
        e?.response?.data?.message ?? e?.message ?? 'Authentication failed';
      throw new Error(message);
    }
  }

  public static async logoutRequest(): Promise<void> {
    try {
      await proxyApi.post('/api/auth/logout');
      localStorage.removeItem('isAuthenticated');
    } catch (err: unknown) {
      const e = err as any;
      const message =
        e?.response?.data?.message ?? e?.message ?? 'Logout failed';
      throw new Error(message);
    }
  }
}
