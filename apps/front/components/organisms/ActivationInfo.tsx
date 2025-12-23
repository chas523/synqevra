import InfoBox from "../molecules/InfoBox";

export interface ActivationInfoProps {
  title?: string;
  description?: string;
  variant?: "blue" | "green" | "yellow" | "gray";
  className?: string;
}

const ActivationInfo = ({
  title = "Activation Information",
  description = "We'll send an activation link to configure your account to the provided email. The process usually takes a few minutes.",
  variant = "blue",
  className = "",
}: ActivationInfoProps) => {
  return (
    <InfoBox
      title={title}
      description={description}
      variant={variant}
      className={className}
    />
  );
};

export default ActivationInfo;
