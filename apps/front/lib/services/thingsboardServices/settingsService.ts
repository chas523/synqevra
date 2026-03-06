import { proxyApi } from "@/lib/api/api";
import { SecuritySettingsDto } from "@/types/settingsTypes";
import {
  GeneralSettingsDto,
  ConnectivitySettingsDto,
} from "@/types/generalSettingsTypes";
import {
  SmsSettings,
  NotificationSettings,
} from "@/types/notificationSettingsTypes";
import { Queue, QueuesPageResponse } from "@/types/queueTypes";

import { MailSettings } from "@/types/mailSettingsTypes";
import { TwoFactorAuthSettings } from "@/types/twoFactorAuthTypes";

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

  public static async getSmsSettings(): Promise<SmsSettings> {
    const { data } = await proxyApi.get("thingsboard/admin/settings/sms");
    return data;
  }

  public static async updateSmsSettings(
    settings: SmsSettings
  ): Promise<SmsSettings> {
    const { data } = await proxyApi.post(
      "thingsboard/admin/settings/sms",
      settings
    );
    return data;
  }

  public static async getNotificationSettings(): Promise<NotificationSettings> {
    const { data } = await proxyApi.get("thingsboard/notification/settings");
    return data;
  }

  public static async updateNotificationSettings(
    settings: NotificationSettings
  ): Promise<NotificationSettings> {
    const { data } = await proxyApi.post(
      "thingsboard/notification/settings",
      settings
    );
    return data;
  }

  public static async getQueues(
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = 'createdTime',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<QueuesPageResponse> {
    const { data } = await proxyApi.get(
      `thingsboard/queues?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`
    );
    return data;
  }

  public static async createQueue(queue: Queue): Promise<Queue> {
    const { data } = await proxyApi.post("thingsboard/queues", queue);
    return data;
  }

  public static async deleteQueue(queueId: string): Promise<void> {
    await proxyApi.delete(`thingsboard/queues/${queueId}`);
  }

  public static async getMailSettings(): Promise<MailSettings> {
    const { data } = await proxyApi.get("thingsboard/admin/settings/mail");
    return data;
  }

  public static async updateMailSettings(
    settings: MailSettings
  ): Promise<MailSettings> {
    const { data } = await proxyApi.post(
      "thingsboard/admin/settings/mail",
      settings
    );
    return data;
    return data;
  }

  public static async getTwoFaSettings(): Promise<TwoFactorAuthSettings> {
    const { data } = await proxyApi.get("thingsboard/2fa/settings");
    return data;
  }

  public static async updateTwoFaSettings(
    settings: TwoFactorAuthSettings
  ): Promise<TwoFactorAuthSettings> {
    const { data } = await proxyApi.post(
      "thingsboard/2fa/settings",
      settings
    );
    return data;
  }

  public static async getTrendzSettings(): Promise<{ enabled: boolean; baseUrl: string; apiKey: string }> {
    const { data } = await proxyApi.get("thingsboard/trendz/settings");
    return data;
  }

  public static async updateTrendzSettings(
    settings: { enabled: boolean; baseUrl: string; apiKey: string }
  ): Promise<{ enabled: boolean; baseUrl: string; apiKey: string }> {
    const { data } = await proxyApi.post("thingsboard/trendz/settings", settings);
    return data;
  }

  // AI Model methods
  public static async getAiModels(
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = "createdTime",
    sortOrder: string = "DESC"
  ): Promise<any> {
    const { data } = await proxyApi.get(
      `thingsboard/ai/model?page=${page}&pageSize=${pageSize}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`
    );
    return data;
  }

  public static async saveAiModel(payload: any): Promise<any> {
    const { data } = await proxyApi.post("thingsboard/ai/model", payload);
    return data;
  }

  public static async deleteAiModel(modelId: string): Promise<any> {
    const { data } = await proxyApi.delete(`thingsboard/ai/model/${modelId}`);
    return data;
  }

  public static async checkAiModelConnectivity(payload: any): Promise<any> {
    const { data } = await proxyApi.post("thingsboard/ai/model/chat", payload);
    return data;
  }

  // Auto-commit settings
  public static async getAutoCommitSettings(): Promise<any> {
    const { data } = await proxyApi.get("thingsboard/autoCommitSettings");
    return data;
  }

  public static async saveAutoCommitSettings(payload: any): Promise<any> {
    const { data } = await proxyApi.post("thingsboard/autoCommitSettings", payload);
    return data;
  }

  public static async deleteAutoCommitSettings(): Promise<any> {
    const { data } = await proxyApi.delete("thingsboard/autoCommitSettings");
    return data;
  }
}
