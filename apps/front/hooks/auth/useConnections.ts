import { useState } from "react";
import useSWR from "swr";
import {
  ConnectionService,
  type GetUserByTokenDto,
} from "@/lib/services/authServices/connectionService";
import { PractitionerService } from "@/lib/services/medplumService/practitionerService";
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
    }
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
    thingsboardConnectionForm: ApiData
  ): Promise<ConnectionResponse | undefined> {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("in hook before");
      const response = await ConnectionService.establishConnection(
        thingsboardConnectionForm,
        token
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
        "Connection not established"
      );
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return { establishConnection, isLoading, error, success };
}

interface ConfigurePractitionerData {
  firstName: string;
  lastName: string;
  userEmail: string;
  userPhone?: string;
  userDescription?: string;
  password: string;
  confirmPassword: string;
}

export function useConfiguratePractitioner(token: string) {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function configurePractitioner(
    data: ConfigurePractitionerData
  ): Promise<void> {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await PractitionerService.configurePractitioner(token, data);
      setSuccess(true);
    } catch (err) {
      const errorMessage = extractErrorMessage(
        err,
        "Failed to configure practitioner"
      );
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return { configurePractitioner, isLoading, error, success };
}

export function useGetUserByToken(token?: string) {
  const { data, error, isLoading } = useSWR(
    token ? `/user/by-token/${token}` : null,
    () => {
      if (!token) throw new Error("Token is required");
      return ConnectionService.getUserByToken(token);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    userData: data,
    isLoading,
    error: error?.message || null,
  };
}
