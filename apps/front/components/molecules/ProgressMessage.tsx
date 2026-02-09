import type { ReactNode } from "react";
import { Text } from "../atoms";

export interface ProgressMessageProps {
  status: "loading" | "success" | "error";
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  actionElement?: ReactNode;
  className?: string;
}

const ProgressMessage = ({
  status,
  loadingMessage = "Loading...",
  successMessage = "Success!",
  errorMessage = "Error occurred",
  actionElement,
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
        className="w-full text-center"
      >
        {messages[status]}
        {actionElement}
      </Text>
    </div>
  );
};

export default ProgressMessage;
