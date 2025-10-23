import { proxyApi } from "@/lib/api/api";
import { extractErrorMessage } from "@/lib/utils";

export type EmailForm = {
  firstName: string;
  lastName: string;
  email: string;
};

export class EmailService {
  public static async emailRequest(formData: EmailForm): Promise<void> {
    try {
      await proxyApi.post("/pending-user/create", formData);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Email send failed");
      throw new Error(message);
    }
  }
}
