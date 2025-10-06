import { useState } from 'react';
import { LoginService } from '../services/loginService';

export function useLogin() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);

    try {
      await LoginService.loginRequest(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return { login, isLoading, error };
}
