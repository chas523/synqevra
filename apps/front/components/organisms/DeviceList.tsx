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
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-10 h-10 text-cyan-500 dark:text-cyan-400 animate-spin" />
          </div>
          <p className="text-slate-500 dark:text-gray-400 text-sm">
            Loading devices...
          </p>
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
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-10 h-10 text-slate-400 dark:text-gray-500" />
          </div>
          <p className="text-slate-500 dark:text-gray-400 text-sm">
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
      className={`h-fit bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl dark:shadow-2xl ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Registered Devices
          </h2>
        </div>
        <div className="text-sm text-slate-500 dark:text-gray-400">
          {devices.length} device{devices.length !== 1 ? "s" : ""}
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default DeviceList;
