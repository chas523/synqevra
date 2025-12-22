import { LogInIcon } from "lucide-react";
import Text from "../atoms/Text";
import Link from "next/link";

export interface ProgressMessageProps {
  status: "loading" | "success" | "error";
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
}

const ProgressMessage = ({
  status,
  loadingMessage = "Loading...",
  successMessage = "Success!",
  errorMessage = "Error occurred",
  className = "",
}: ProgressMessageProps) => {
  const baseStyles = ["text-center", "min-h-[3rem]", "flex", "items-center"];
  const allStyles = [...baseStyles, className];

  const messages = {
    loading: loadingMessage,
    success: successMessage,
    error: errorMessage,
  };

  const colors = {
    loading: "default" as const,
    success: "success" as const,
    error: "error" as const,
  };

  return (
    <div className={allStyles.join(" ")}>
      <Text
        color={colors[status]}
        weight="medium"
        align="center"
        className="w-full"
      >
        {messages[status]}
        {status === "success" && (
          <Link
            className="ml-2 text-slate-500 hover:underline"
            href="auth/login"
          >
            Go to Login
          </Link>
        )}
      </Text>
    </div>
  );
};

export default ProgressMessage;
