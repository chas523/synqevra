import { proxyApi } from "@/lib/api/api";
import { User } from "@/lib/redux/slices/userSlice/userSlice";
import type {
  ActiveUsersRequestOptions,
  AdminPanelUser,
  MailRecipient,
  PaginatedResponse,
  PendingUser,
  RequestedAccessUsersRequestOptions,
} from "@/lib/types/dashboardTypes";
import { buildQueryParams, extractErrorMessage } from "@/lib/utils";

// Mock data for testing
const mockPendingUsers: PendingUser[] = [
  {
    id: "1",
    email: "john.doe@company.com",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    status: "pending",
  },
  {
    id: "2",
    email: "jane.smith@startup.io",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2024-01-14T15:45:00Z",
    updatedAt: "2024-01-14T15:45:00Z",
    status: "new",
  },
  {
    id: "3",
    email: "alex.wilson@tech.com",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2024-01-13T09:20:00Z",
    updatedAt: "2024-01-13T09:20:00Z",
    status: "pending",
  },
  {
    id: "4",
    email: "maria.garcia@innovate.co",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2024-01-12T14:10:00Z",
    updatedAt: "2024-01-12T14:10:00Z",
    status: "new",
  },
  {
    id: "5",
    email: "david.chen@global.org",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2024-01-11T11:30:00Z",
    updatedAt: "2024-01-11T11:30:00Z",
    status: "pending",
  },
  {
    id: "6",
    firstName: "John",
    lastName: "Doe",
    email: "sarah.johnson@enterprise.net",
    createdAt: "2024-01-10T16:45:00Z",
    updatedAt: "2024-01-10T16:45:00Z",
    status: "new",
  },
  {
    id: "7",
    email: "michael.brown@solutions.biz",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2024-01-09T08:15:00Z",
    updatedAt: "2024-01-09T08:15:00Z",
    status: "pending",
  },
  {
    id: "8",
    email: "lisa.davis@creative.agency",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2024-01-08T13:25:00Z",
    updatedAt: "2024-01-08T13:25:00Z",
    status: "new",
  },
];

const mockActiveUsers: AdminPanelUser[] = [
  {
    id: "a1",
    email: "admin@company.com",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2023-12-01T10:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
  },
  {
    id: "a2",
    email: "manager@company.com",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2023-12-05T09:15:00Z",
    updatedAt: "2024-01-14T16:20:00Z",
  },
  {
    id: "a3",
    email: "developer@company.com",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2023-12-10T11:45:00Z",
    updatedAt: "2024-01-13T12:10:00Z",
  },
  {
    id: "a4",
    email: "designer@company.com",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2023-12-15T14:20:00Z",
    updatedAt: "2024-01-12T09:45:00Z",
  },
  {
    id: "a5",
    email: "analyst@company.com",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2023-12-20T16:30:00Z",
    updatedAt: "2024-01-11T15:25:00Z",
  },
  {
    id: "a6",
    firstName: "John",
    lastName: "Doe",
    email: "support@company.com",
    createdAt: "2023-12-25T08:45:00Z",
    updatedAt: "2024-01-10T11:15:00Z",
  },
];

export class UserService {
  public static async getUsersThatRequestedAccess(
    requestOptions: RequestedAccessUsersRequestOptions,
  ): Promise<PaginatedResponse<PendingUser>> {
    // return {
    //   data: mockPendingUsers,
    //   total: mockPendingUsers.length,
    //   pagination: {
    //     limit: mockPendingUsers.length,
    //     hasNext: false,
    //     hasPrev: false,
    //   },
    // };

    const params = buildQueryParams(requestOptions as Record<string, unknown>);
    try {
      const response = await proxyApi.get(
        `/pending-user/list?${params.toString()}`,
      );
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }

  public static async sendEmailActivationLink(
    mailRecipient: MailRecipient,
  ): Promise<void> {
    try {
      await proxyApi.post("/mailer/email-activation-link", mailRecipient);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }

  public static async getActiveUsers(
    _requestOptions: ActiveUsersRequestOptions,
  ): Promise<PaginatedResponse<AdminPanelUser>> {
    return {
      data: mockActiveUsers,
      total: mockActiveUsers.length,
      pagination: {
        limit: mockActiveUsers.length,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  public static async getProfile(): Promise<User> {
    try {
      const response = await proxyApi.get("/auth/profile");
      return response.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }

  // const params = buildQueryParams(requestOptions as Record<string, unknown>);
  // try {
  //   const response = await proxyApi.get(
  //     `/api/users/active?${params.toString()}`,
  //   );
  //   return response.data;
  // } catch (err) {
  //   throw new Error(extractErrorMessage(err));
  // }
}
