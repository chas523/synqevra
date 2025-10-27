import InfoButton from "../atoms/InfoButton";

export interface InfoTooltipProps {
  content: React.ReactNode;
  buttonProps?: React.ComponentProps<typeof InfoButton>;
}

const InfoTooltip = ({ content, buttonProps = {} }: InfoTooltipProps) => {
  const baseTooltipStyles = [
    "absolute",
    "right-0",
    "top-7",
    "z-10",
    "hidden",
    "group-hover:block",
    "group-focus-within:block",
    "min-w-[220px]",
    "bg-white",
    "dark:bg-gray-900",
    "text-gray-800",
    "dark:text-gray-100",
    "text-xs",
    "rounded",
    "shadow-lg",
    "p-3",
    "border",
    "border-gray-200",
    "dark:border-gray-700",
  ];

  return (
    <div className="relative group flex items-center">
      <InfoButton tabIndex={0} aria-label="More info" {...buttonProps} />
      <div className={baseTooltipStyles.join(" ")}>{content}</div>
    </div>
  );
};

export default InfoTooltip;
