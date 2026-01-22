import { proxyApi } from "@/lib/api/api";
import { SecuritySettingsDto } from "@/types/settingsTypes";

export class SettingsService {
  public static async getSecuritySettings(): Promise<SecuritySettingsDto> {
    const { data } = await proxyApi.get("thingsboard/admin/securitySettings");
    return data;
  }

  //   public static async getSecuritySettings(): Promise<SecuritySettingsDto> {
  //     return Promise.resolve({
  //       passwordPolicy: {
  //         minimumLength: 6,
  //         maximumLength: 72,
  //         minimumUppercaseLetters: null,
  //         minimumLowercaseLetters: null,
  //         minimumDigits: null,
  //         minimumSpecialCharacters: null,
  //         passwordExpirationPeriodDays: null,
  //         passwordReuseFrequencyDays: null,
  //       },
  //       maxFailedLoginAttempts: null,
  //       userLockoutNotificationEmail: null,
  //       mobileSecretKeyLength: 64,
  //       userActivationTokenTtl: 24,
  //       passwordResetTokenTtl: 24,
  //     });
  //   }

  /*
    public static async updateSecuritySettings(
        settings: SecuritySettingsDto
    ): Promise<SecuritySettingsDto> {
        const { data } = await proxyApi.post("/admin/securitySettings", settings);
        return data;
    }
    */

  public static async updateSecuritySettings(
    settings: SecuritySettingsDto
  ): Promise<SecuritySettingsDto> {
    const { data } = await proxyApi.post(
      "thingsboard/admin/securitySettings",
      settings
    );
    return data;
  }
}
