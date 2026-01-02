"use client";

import { MoreVertical, Copy, Trash2 } from "lucide-react";
import type { Device } from "@/types/thingsboardDeviceTypes";
import DeviceIcon from "../atoms/DeviceIcon";
import StatusBadge from "../atoms/StatusBadge";

export interface DeviceCardProps {
  device: Device;
  index: number;
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onDeviceClick?: (device: Device) => void;
  onDuplicate?: (device: Device) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const DeviceCard = ({
  device,
  index,
  openMenuId,
  onToggleMenu,
  onDeviceClick,
  onDuplicate,
  onDelete,
  className = "",
}: DeviceCardProps) => {
  const getDeviceIconColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "temperature":
        return "bg-red-500/20 text-red-400";
      case "heart_rate":
        return "bg-pink-500/20 text-pink-400";
      case "oxygen":
        return "bg-blue-500/20 text-blue-400";
      case "blood_pressure":
        return "bg-purple-500/20 text-purple-400";
      case "glucose":
        return "bg-yellow-500/20 text-yellow-400";
      case "ecg":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const deviceId = device.id?.id || "";
  const showMenu = openMenuId === deviceId;
  const hasActions = onDuplicate || onDelete;

  return (
    <div
      className={`group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all animate-fade-in cursor-pointer ${className}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onDeviceClick?.(device)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${getDeviceIconColor(
              device.type
            )}`}
          >
            <DeviceIcon type={device.type} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium truncate mb-1">
              {device.name}
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <StatusBadge active={device.active}>
                {device.active ? "Active" : "Inactive"}
              </StatusBadge>
              <span className="text-gray-400">{device.label || "-"}</span>
            </div>
          </div>
        </div>

        {hasActions && (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu(showMenu ? null : deviceId);
              }}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 bg-[#1a1f2e] border border-white/20 rounded-xl shadow-2xl overflow-hidden z-10 min-w-[180px] animate-fade-in">
                {onDuplicate && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(device);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-3"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate device
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(deviceId);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete device
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceCard;
