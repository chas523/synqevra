import { Icon } from "../atoms";

export interface LoadingOverlayInformationProps {
  text?: string;
  className?: string;
}

const LoadingOverlayInformation = ({
  text = "Checking token validity...",
  className = "",
}: LoadingOverlayInformationProps) => {
  const baseStyles = ["text-center", "flex", "flex-col", "items-center"];
  const allStyles = [...baseStyles, className];
  return (
    <div className={allStyles.join(" ")}>
      <Icon name="loading" size="lg" />
      <p className="text-lg text-slate-400">{text}</p>
    </div>
  );
};

export default LoadingOverlayInformation;
