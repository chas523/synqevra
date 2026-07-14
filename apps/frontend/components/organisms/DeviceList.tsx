"use client";

import { useState } from "react";
import { Zap, Package, Loader2 } from "lucide-react";
import type { Device } from "@/types/thingsboardDeviceTypes";
import DeviceCard from "../molecules/DeviceCard";
import PaginationControls from "../molecules/PaginationControls";

export interface DeviceListProps {
  devices: Device[];
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error?: Error | null;
  onDeviceClick: (device: Device) => void;
  onPageChange: (page: number) => void;
  onDuplicate?: (device: Device) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const DeviceList = ({
  devices,
  totalPages,
  currentPage,
  isLoading,
  error,
  onDeviceClick,
  onPageChange,
  onDuplicate,
  onDelete,
  className = "",
}: DeviceListProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-16">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted/40">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading devices...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-10 h-10 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-red-500 dark:text-red-400 text-sm">
            Error loading devices
          </p>
        </div>
      );
    }

    if (devices.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted/40">
            <Zap className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No devices yet. Create your first device to get started.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-3">
          {devices.map((device, index) => (
            <DeviceCard
              key={device.id?.id}
              device={device}
              index={index}
              openMenuId={openMenuId}
              onToggleMenu={setOpenMenuId}
              onDeviceClick={onDeviceClick}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))}
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="mt-4"
        />
      </>
    );
  };

  return (
    <div
      className={`h-fit rounded-3xl border border-border bg-card p-6 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/60 text-accent-foreground">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Registered Devices
          </h2>
        </div>
        <div className="text-sm text-muted-foreground">
          {devices.length} device{devices.length !== 1 ? "s" : ""}
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default DeviceList;
