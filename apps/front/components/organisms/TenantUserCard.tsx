import { Mail, Calendar, User, Shield } from "lucide-react";
import type { TenantUser } from "@/lib/types/dashboardTypes";
import { Button } from "@/components/ui/button";
import { formatTenantDate } from "@/lib/utils";

interface TenantUserCardProps {
  user: TenantUser;
  onViewDetails?: () => void;
}

export function TenantUserCard({ user, onViewDetails }: TenantUserCardProps) {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  const createdDate = formatTenantDate(user.createdTime);

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <User className="h-5 w-5 text-gray-400 mt-1 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900">{fullName}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>

              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{user.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span className="capitalize">
                  {user.authority.toLowerCase()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {createdDate}
              </div>
            </div>
          </div>
        </div>

        {onViewDetails && (
          <Button
            onClick={onViewDetails}
            className="text-sm text-blue-600 hover: text-blue-700 whitespace-nowrap ml-2"
          >
            View details
          </Button>
        )}
      </div>
    </div>
  );
}
