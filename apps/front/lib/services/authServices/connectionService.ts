import { proxyApi } from "@/lib/api/api";
import { createStandardError } from "@/lib/utils";
import type {
  ApiData,
  ConnectionResponse,
  TokenValidationResponse,
} from "@/types/connectionTypes";

export class ConnectionService {
  public static async checkTokenValidation(
    token: string,
  ): Promise<TokenValidationResponse> {
    try {
      const { data } = await proxyApi.get(
        `/connection/checkValidation?token=${encodeURIComponent(token)}`,
      );
      return data;
    } catch (err: unknown) {
      throw createStandardError(err, "Token validation failed");
    }
  }

  public static async establishConnection(
    formData: ApiData,
    token?: string,
  ): Promise<ConnectionResponse> {
    try {
      const url = token
        ? `/connection/connect?token=${encodeURIComponent(token)}`
        : "/connection/connect";
      const { data } = await proxyApi.post(url, formData);
      return data;
    } catch (err: unknown) {
      throw createStandardError(err, "Connection not established");
    }
  }

  //next functionality
}
