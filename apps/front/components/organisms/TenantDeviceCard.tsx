import { Server, Cpu, Tag, Calendar, Wifi, WifiOff } from "lucide-react";
import type { DeviceData } from "@/lib/types/dashboardTypes";

interface TenantDeviceCardProps {
  device: DeviceData;
  onViewDetails?: () => void;
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function TenantDeviceCard({ device }: TenantDeviceCardProps) {
  const createdDate = formatDate(device.createdTime);

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Server className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">{device.name}</h3>
              {device.active !== undefined && (
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    device.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {device.active ? (
                    <Wifi className="h-3 w-3" />
                  ) : (
                    <WifiOff className="h-3 w-3" />
                  )}
                  {device.active ? "Active" : "Inactive"}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {device.label || device.type}
            </p>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Cpu className="h-4 w-4" />
                <span className="capitalize">{device.type.toLowerCase()}</span>
              </div>

              {device.deviceProfileName && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="h-4 w-4" />
                  <span>{device.deviceProfileName}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {createdDate}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
