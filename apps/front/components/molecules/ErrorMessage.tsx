import Text from "../atoms/Text";

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

  return (
    <Text size="xs" color="error" align={align} className={allStyles.join(" ")}>
      {message}
    </Text>
  );
};

export default ErrorMessage;
