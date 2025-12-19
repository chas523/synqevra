import { Icon, Text } from "../atoms";

interface UserInfoItemProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: "email" | "name" | "date";
}

export const UserInfoItem = ({
  icon,
  children,
  variant = "email",
}: UserInfoItemProps) => {
  const textVariant = variant === "date" ? "caption" : "body";
  const textColor = variant === "name" ? "muted" : "default";

  return (
    <div className="flex items-center gap-4">
      <Icon size="sm" className="sm:h-4 sm:w-4">
        {icon}
      </Icon>
      <Text
        variant={textVariant}
        color={textColor}
        weight={variant === "email" ? "medium" : "normal"}
      >
        {children}
      </Text>
    </div>
  );
};
