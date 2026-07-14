import { Icon, Text } from "../atoms";

interface UserInfoItemProps {
  icon: "mail" | "users" | "calendar";
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
  const textWeight = variant === "email" ? "medium" : "normal";

  return (
    <div className="flex items-center gap-4">
      <Icon name={icon} size="sm" />
      <Text variant={textVariant} color={textColor} weight={textWeight}>
        {children}
      </Text>
    </div>
  );
};
