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
}


