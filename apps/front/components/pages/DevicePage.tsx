"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DeviceManagementTemplate from "@/components/templates/DeviceManagementTemplate";
import { useCreateDevice } from "@/hooks/thingsboard/device/useCreateDevice";
import { useDevices } from "@/hooks/thingsboard/device/useDevices";
import type {
  CreateDeviceRequest,
  Device,
} from "@/types/thingsboardDeviceTypes";

const DevicePage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();

  const { devices, totalPages, isLoading, error, refresh } =
    useDevices(currentPage);

  const {
    createDevice,
    loading: isCreating,
    error: errorCreating,
  } = useCreateDevice();

  const handleDeviceSubmit = async (deviceData: CreateDeviceRequest) => {
    try {
      await createDevice(deviceData);
      refresh();
    } catch (err) {
      console.error("Error creating device:", err);
      throw err;
    }
  };

  const handleDeviceClick = (device: Device) => {
    router.push(`/devices/${device.id.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <DeviceManagementTemplate
      title="Device Management"
      deviceFormProps={{
        onSubmit: handleDeviceSubmit,
        isLoading: isCreating,
        error: errorCreating,
      }}
      deviceListProps={{
        devices,
        totalPages,
        currentPage,
        isLoading,
        error,
        onDeviceClick: handleDeviceClick,
        onPageChange: handlePageChange,
      }}
    />
  );
};

export default DevicePage;
