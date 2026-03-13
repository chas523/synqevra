import { useState } from "react";
import { UserService } from "@/lib/services/userServices/userService";
import { MailRecipient } from "@/lib/types/dashboardTypes";

interface UseSendEmailActivationResult {
  sendEmailActivation: (mailRecipient: MailRecipient) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useSendEmailActivation = (): UseSendEmailActivationResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmailActivation = async (mailRecipient: MailRecipient) => {
    setIsLoading(true);
    setError(null);

    try {
      await UserService.sendEmailActivationLink(mailRecipient);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendEmailActivation,
    isLoading,
    error,
  };
};
