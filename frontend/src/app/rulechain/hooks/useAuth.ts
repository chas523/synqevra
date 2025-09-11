"use client";

import { useState, useEffect, useCallback } from "react";
import { medplum } from "../../../lib/medplum";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    loading: true,
    error: null,
  });

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = medplum.getAccessToken();
      const isAuthenticated = await medplum.isAuthenticated();

      setAuthState({
        isAuthenticated,
        accessToken: token,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        accessToken: null,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Authentication check failed",
      });
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const loginResult = await medplum.startLogin({
        email,
        password,
        remember: false,
        scope: "openid offline_access",
      });

      await medplum.processCode(loginResult.code);
      await checkAuthStatus();
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Login failed",
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await medplum.signOut();
      setAuthState({
        isAuthenticated: false,
        accessToken: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus,
  };
};
