import { useState } from "react";
import {
  type EmailForm,
  EmailService,
} from "@/lib/services/authServices/emailService";

export function useEmailSend() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function sendEmail(formData: EmailForm) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await EmailService.emailRequest(formData);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email send failed");
    } finally {
      setLoading(false);
    }
  }

  return { sendEmail, isLoading, error, success };
}
