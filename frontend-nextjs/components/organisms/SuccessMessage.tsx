import Heading from "../atoms/Heading";
import Text from "../atoms/Text";
import { StatusIcon } from "../molecules";

export interface SuccessMessageProps {
  title?: string;
  description?: string;
  className?: string;
}

const SuccessMessage = ({
  title = "Thank you for signing up!",
  description = "We'll send you an email with further instructions shortly.",
  className = "",
}: SuccessMessageProps) => {
  const baseStyles = ["text-center", "py-3"];

  const allStyles = [...baseStyles, className];

  return (
    <div className={allStyles.join(" ")}>
      <StatusIcon status="success" />

      <Heading level={3} size="md" className="mb-1">
        {title}
      </Heading>

      <Text size="sm" color="muted" align="center">
        {description}
      </Text>
    </div>
  );
};

export default SuccessMessage;
