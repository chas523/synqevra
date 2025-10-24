import { Calendar, Mail, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { ActionButtons, UserInfoItem } from "../molecules";

interface BaseUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  status?: "new" | "pending";
}

interface UserCardProps {
  user: BaseUser;
  variant?: "requested" | "active";
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const UserCard = ({
  user,
  variant = "requested",
  onPrimaryAction,
  onSecondaryAction,
  isLoading = false,
  className,
}: UserCardProps) => {
  const showBadge = variant === "requested" && user.status === "pending";
  const showActions =
    (variant === "requested" && user.status === "new") || variant === "active";

  return (
    <div
      className={cn(
        "p-4 border rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base",
        className,
      )}
    >
      <div className="flex justify-between flex-col sm:flex-row">
        <div className="flex-1 space-y-2">
          <UserInfoItem icon={<Mail />} variant="email">
            {user.email}
          </UserInfoItem>

          {user.firstName && user.lastName && (
            <UserInfoItem icon={<Users />} variant="name">
              {user.firstName} {user.lastName}
            </UserInfoItem>
          )}

          <UserInfoItem icon={<Calendar />} variant="date">
            {formatDate(user.createdAt)}
          </UserInfoItem>
        </div>

        <div className="flex flex-col gap-2">
          {showBadge && (
            <Badge variant="secondary" className="gap-1">
              <span className="h-3 w-3">📄</span>
              Pending
            </Badge>
          )}

          {showActions && (
            <ActionButtons
              variant={variant}
              isLoading={isLoading}
              onPrimaryAction={onPrimaryAction}
              onSecondaryAction={onSecondaryAction}
            />
          )}
        </div>
      </div>
    </div>
  );
};
