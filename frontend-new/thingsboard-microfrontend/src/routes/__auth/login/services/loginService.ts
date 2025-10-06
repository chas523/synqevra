import { thingsBoardApi } from '@/api/api';

interface LoginResponse {
  token: string;
}
export class LoginService {
  public static async loginRequest(
    email: string,
    password: string,
  ): Promise<LoginResponse> {
    try {
      const { data } = await thingsBoardApi.post<LoginResponse>(
        '/api/auth/login',
        {
          username: email,
          password,
        },
      );
      localStorage.setItem('accessToken', data.token);
      return data;
    } catch (err: unknown) {
      const e = err as any;
      const message =
        e?.response?.data?.message ?? e?.message ?? 'Authentication failed';
      throw new Error(message);
    }
  }

  public static logoutRequest() {
    localStorage.removeItem('accessToken');
  }
}
