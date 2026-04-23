"use client";

import { MoreVertical, Copy, Trash2 } from "lucide-react";
import type { Device } from "@/types/thingsboardDeviceTypes";
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
  const deviceId = device.id?.id || "";
  const showMenu = openMenuId === deviceId;
  const hasActions = onDuplicate || onDelete;

  return (
    <div
      className={`group bg-background hover:bg-muted dark:bg-white/5 dark:hover:bg-white/10 border border-border hover:border-border/70 dark:border-white/10 dark:hover:border-white/20 rounded-2xl p-3 transition-all animate-fade-in cursor-pointer shadow-sm hover:shadow-md dark:shadow-none ${className}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onDeviceClick?.(device)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-20 h-auto rounded-xl flex items-center justify-center">
            <img
              src={
                device.active
                  ? "/active-device-pulse.svg"
                  : "/inactive-device-pulse.svg"
              }
              alt="Device Status"
              className="w-full h-auto"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-slate-900 dark:text-white font-medium truncate mb-1">
              {device.name}
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <StatusBadge active={device.active}>
                {device.active ? "Active" : "Inactive"}
              </StatusBadge>
              <span className="text-slate-500 dark:text-gray-400">
                {device.label || "-"}
              </span>
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
              className="w-8 h-8 rounded-lg bg-muted hover:bg-border dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground/70 dark:text-gray-400 dark:hover:text-white transition-all"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 bg-background dark:bg-[#1a1f2e] border border-border dark:border-white/20 rounded-xl shadow-2xl overflow-hidden z-10 min-w-45 animate-fade-in">
                {onDuplicate && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(device);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-muted-foreground hover:bg-muted dark:text-gray-300 dark:hover:bg-white/10 transition-colors flex items-center gap-3"
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
