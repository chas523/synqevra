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
      className={`group cursor-pointer rounded-2xl border border-border bg-background p-3 shadow-sm transition-all hover:bg-muted/50 hover:border-border/70 hover:shadow-md animate-fade-in ${className}`}
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
            <h3 className="mb-1 truncate font-medium text-foreground">
              {device.name}
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <StatusBadge active={device.active}>
                {device.active ? "Active" : "Inactive"}
              </StatusBadge>
              <span className="text-muted-foreground">
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
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 z-10 min-w-45 overflow-hidden rounded-xl border border-border bg-popover shadow-lg animate-fade-in">
                {onDuplicate && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(device);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
