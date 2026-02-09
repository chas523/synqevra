import { Text } from "../atoms";

export interface ErrorMessageProps {
  message: string;
  align?: "left" | "center" | "right";
  className?: string;
}

const ErrorMessage = ({
  message,
  align = "center",
  className = "",
}: ErrorMessageProps) => {
  const baseStyles = ["mt-2"];
  const allStyles = [...baseStyles, className];

  const textAlignClass = `text-${align}`;

  return (
    <Text size="xs" color="error" className={`${allStyles.join(" ")} ${textAlignClass}`}>
      {message}
    </Text>
  );
};

export default ErrorMessage;
