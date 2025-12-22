import { useEffect, useState } from "react";
import Heading from "../atoms/Heading";
import { ProgressMessage, StatusIcon } from "../molecules";

export interface ProgressContentProps {
  status: "loading" | "success" | "error";
  title?: string;
  messages?: string[];
  successMessage?: string;
  errorMessage?: string;
  className?: string;
}

const ProgressContent = ({
  status,
  title = "Configuring Your Account",
  messages = ["Processing..."],
  successMessage = "Account configured successfully!",
  errorMessage = "Configuration failed",
  className = "",
}: ProgressContentProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Cycle through messages during loading
  useEffect(() => {
    if (status !== "loading") return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < messages.length - 1) {
          return prev + 1;
        }
        return prev; // Stay at last message
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, messages.length]);

  // Reset message index when status changes to loading
  useEffect(() => {
    if (status === "loading") {
      setCurrentMessageIndex(0);
    }
  }, [status]);

  const baseStyles = ["flex", "flex-col", "items-center", "space-y-6"];
  const allStyles = [...baseStyles, className];

  const getCurrentMessage = () => {
    if (status === "loading") {
      return messages[currentMessageIndex] || "Processing...";
    }
    return status === "success" ? successMessage : errorMessage;
  };

  return (
    <div className={allStyles.join(" ")}>
      <Heading level={3} size="lg" className="mb-8 text-center">
        {title}
      </Heading>

      <StatusIcon status={status} />

      <ProgressMessage
        status={status}
        loadingMessage={getCurrentMessage()}
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default ProgressContent;
