import { useState } from "react";
import useSWR from "swr";
import { ConnectionService } from "@/lib/services/authServices/connectionService";
import { extractErrorMessage } from "@/lib/utils";
import type { ApiData, ConnectionResponse } from "@/types/connectionTypes";

export function useTokenValidation(token?: string) {
  const { data, error, isLoading } = useSWR(
    token ? `/connection/checkValidation/${token}` : null,
    () => {
      if (!token) throw new Error("Token is required");
      return ConnectionService.checkTokenValidation(token);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    data,
    isLoading,
    error: error?.message || null,
    isValid: data?.valid,
  };
}

export function useEstablishConnection(token: string) {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function establishConnection(
    thingsboardConnectionForm: ApiData,
  ): Promise<ConnectionResponse | undefined> {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("in hook before");
      const response = await ConnectionService.establishConnection(
        thingsboardConnectionForm,
        token,
      );
      console.log("in hook after");
      // Save data to localStorage as thingsboard object
      const thingsboardData = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        tenantId: response.tenantId,
      };
      localStorage.setItem("thingsboard", JSON.stringify(thingsboardData));

      // Log success message
      console.log("ThingsBoard connection success:", response.message);

      setSuccess(true);
      return response;
    } catch (err) {
      const errorMessage = extractErrorMessage(
        err,
        "Connection not established",
      );
      setError(errorMessage);
      throw err; // Propagate original error to component
    } finally {
      setLoading(false);
    }
  }

  return { establishConnection, isLoading, error, success };
}
