import { proxyApi } from "@/lib/api/api";
import type {
  NotificationsRequestOptions,
  PaginatedResponse,
  Notification,
} from "@/lib/types/dashboardTypes";
import { extractErrorMessage } from "@/lib/utils";

export class NotificationService {
  public static async getNotifications(
    options: NotificationsRequestOptions,
  ): Promise<PaginatedResponse<Notification>> {
    try {
      const params = new URLSearchParams();

      params.append("page", (options.page ?? 0).toString());
      params.append("pageSize", (options.limit ?? 20).toString());

      if (options.sortBy) {
        params.append("sortProperty", options.sortBy);
      }

      if (options.sortOrder) {
        params.append("sortOrder", options.sortOrder.toUpperCase());
      }

      const response = await proxyApi.get<GetNotificationsResponse>(
        `/dashboard/notifications?${params.toString()}`,
      );

      return this.mapNotificationsResponse(response.data, options.limit ?? 20);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Failed to fetch notifications");
      throw new Error(message);
    }
  }

  private static mapNotificationsResponse(
    data: GetNotificationsResponse,
    limit: number,
  ): PaginatedResponse<Notification> {
    return {
      data: data.data || [],
      pagination: {
        limit,
        hasNext: data.hasNext ?? false,
        hasPrev: false,
        nextCursor: undefined,
        prevCursor: undefined,
      },
      total: data.totalElements ?? 0,
    };
  }
}

interface GetNotificationsResponse {
  data: Notification[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}
