import { proxyApi } from "@/lib/api/api";
import { SecuritySettingsDto } from "@/types/settingsTypes";
import {
  GeneralSettingsDto,
  ConnectivitySettingsDto,
} from "@/types/generalSettingsTypes";

export class SettingsService {
  public static async getSecuritySettings(): Promise<SecuritySettingsDto> {
    const { data } = await proxyApi.get("thingsboard/admin/securitySettings");
    return data;
  }

  public static async updateSecuritySettings(
    settings: SecuritySettingsDto
  ): Promise<SecuritySettingsDto> {
    const { data } = await proxyApi.post(
      "thingsboard/admin/securitySettings",
      settings
    );
    return data;
  }

  public static async getGeneralSettings(): Promise<GeneralSettingsDto> {
    const { data } = await proxyApi.get("thingsboard/admin/settings/general");
    return data;
  }

  public static async updateGeneralSettings(
    settings: GeneralSettingsDto
  ): Promise<GeneralSettingsDto> {
    const { data } = await proxyApi.post(
      "thingsboard/admin/settings/general",
      settings
    );
    return data;
  }

  public static async getConnectivitySettings(): Promise<ConnectivitySettingsDto> {
    const { data } = await proxyApi.get(
      "thingsboard/admin/settings/connectivity"
    );
    return data;
  }

  public static async updateConnectivitySettings(
    settings: ConnectivitySettingsDto
  ): Promise<ConnectivitySettingsDto> {
    const { data } = await proxyApi.post(
      "thingsboard/admin/settings/connectivity",
      settings
    );
    return data;
  }
}

