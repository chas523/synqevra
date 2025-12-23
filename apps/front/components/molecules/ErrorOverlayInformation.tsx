import { Icon } from "../atoms";

export interface ErrorOverlayInformationProps {
  text?: string;
  className?: string;
}

const ErrorOverlayInformation = ({
  text = "Checking token validity...",
  className = "",
}: ErrorOverlayInformationProps) => {
  const baseStyles = ["text-center", "flex", "flex-col", "items-center"];
  const allStyles = [...baseStyles, className];
  return (
    <div className={allStyles.join(" ")}>
      <Icon name="error" size="lg" className="text-red-500" />
      <p className="text-lg text-red-600">{text}</p>
    </div>
  );
};

export default ErrorOverlayInformation;
