import {
  Calendar,
  Check as CheckIcon,
  InfoIcon,
  Loader2Icon,
  Mail,
  Users,
  XCircle as XCircleIcon,
} from "lucide-react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: "info" | "loading" | "error" | "success" | "mail" | "users" | "calendar";
  size?: "sm" | "md" | "lg";
}

const Icon = ({ name, size = "md", className = "", ...props }: IconProps) => {
  const baseStyles = ["fill-none", "stroke-currentColor"];

  const sizeStyles = {
    sm: ["w-4", "h-4"],
    md: ["w-6", "h-6"],
    lg: ["w-8", "h-8"],
  };

  const allStyles = [...baseStyles, ...sizeStyles[size], className];

  const icons = {
    info: <InfoIcon className={allStyles.join(" ")} {...props} />,
    loading: (
      <Loader2Icon
        aria-label="Loading"
        className={[...allStyles, "animate-spin"].join(" ")}
        {...props}
      />
    ),
    error: <XCircleIcon className={allStyles.join(" ")} {...props} />,
    success: <CheckIcon className={allStyles.join(" ")} {...props} />,
    mail: <Mail className={allStyles.join(" ")} {...props} />,
    users: <Users className={allStyles.join(" ")} {...props} />,
    calendar: <Calendar className={allStyles.join(" ")} {...props} />,
  };

  return icons[name];
};

export default Icon;
