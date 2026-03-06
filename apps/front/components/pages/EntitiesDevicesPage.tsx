"use client";

import { useState, useCallback } from "react";
import { EntitiesDevicesTable } from "@/components/organisms/EntitiesDevicesTable";
import { DeviceCredentialsDialog } from "@/components/organisms/DeviceCredentialsDialog";
import { AddDeviceDialog } from "@/components/organisms/AddDeviceDialog";
import { DeviceDetailPanel } from "@/components/organisms/DeviceDetailPanel";
import { useEntityDevices } from "@/hooks/thingsboard/device/useEntityDevices";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import type { Device } from "@/types/thingsboardDeviceTypes";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export const EntitiesDevicesPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const { devices, totalPages, totalElements, isLoading, mutate } =
    useEntityDevices(currentPage, PAGE_SIZE, sortProperty, sortOrder);

  // Credentials dialog
  const [credentialsDevice, setCredentialsDevice] = useState<Device | null>(null);
  const [credentialsOpen, setCredentialsOpen] = useState(false);

  // Add Device dialog
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);

  // Side panel
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const handleAddDeviceSubmit = useCallback(async (deviceData: any) => {
    try {
      await DeviceService.createDevice(deviceData);
      toast.success(`Device "${deviceData.name}" created successfully`);
      setAddDeviceOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create device");
      throw err;
    }
  }, [mutate]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSortChange = useCallback(
    (property: string, order: "ASC" | "DESC") => {
      setSortProperty(property);
      setSortOrder(order);
      setCurrentPage(0);
    },
    []
  );

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleMakePublic = useCallback(
    async (device: Device) => {
      try {
        await DeviceService.makeDevicePublic(device.id?.id ?? "");
        toast.success(`"${device.name}" is now public`);
        mutate();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to make device public");
      }
    },
    [mutate]
  );

  const handleMakePrivate = useCallback(
    async (device: Device) => {
      try {
        await DeviceService.makeDevicePrivate(device.id?.id ?? "");
        toast.success(`"${device.name}" is now private`);
        mutate();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to make device private");
      }
    },
    [mutate]
  );

  const handleDelete = useCallback(
    async (device: Device) => {
      try {
        await DeviceService.deleteDevice(device.id?.id ?? "");
        toast.success(`"${device.name}" deleted`);
        mutate();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to delete device");
      }
    },
    [mutate]
  );

  const handleAssignToCustomer = useCallback((device: Device) => {
    toast.info(`Assign to customer: ${device.name} (coming soon)`);
  }, []);

  const handleManageCredentials = useCallback((device: Device) => {
    setCredentialsDevice(device);
    setCredentialsOpen(true);
  }, []);

  return (
    <>
      <EntitiesDevicesTable
        devices={devices}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        onMakePublic={handleMakePublic}
        onMakePrivate={handleMakePrivate}
        onAssignToCustomer={handleAssignToCustomer}
        onManageCredentials={handleManageCredentials}
        onDelete={handleDelete}
        onAdd={() => setAddDeviceOpen(true)}
        onRowClick={(device) => setSelectedDevice(device)}
      />

      <AddDeviceDialog
        open={addDeviceOpen}
        onOpenChange={setAddDeviceOpen}
        onSubmit={handleAddDeviceSubmit}
      />

      <DeviceDetailPanel
        device={selectedDevice}
        isOpen={!!selectedDevice}
        onClose={() => setSelectedDevice(null)}
        onRefresh={() => mutate()}
      />

      <DeviceCredentialsDialog
        open={credentialsOpen}
        device={credentialsDevice}
        onOpenChange={setCredentialsOpen}
        onSuccess={() => mutate()}
      />
    </>
  );
};


