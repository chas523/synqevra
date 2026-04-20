"use client";

import { useState, useCallback, useRef } from "react";
import { EntitiesDevicesTable } from "@/components/organisms/EntitiesDevicesTable";
import { DeviceCredentialsDialog } from "@/components/organisms/DeviceCredentialsDialog";
import { AddDeviceDialog } from "@/components/organisms/AddDeviceDialog";
import { DeviceDetailPanel } from "@/components/organisms/DeviceDetailPanel";
import { useEntityDevices } from "@/hooks/thingsboard/device/useEntityDevices";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import type { Device } from "@/types/thingsboardDeviceTypes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Upload } from "lucide-react";

const PAGE_SIZE = 10;

export const EntitiesDevicesPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const { devices, totalPages, totalElements, isLoading, mutate } =
    useEntityDevices(currentPage, PAGE_SIZE, sortProperty, sortOrder);

  // Credentials dialog
  const [credentialsDevice, setCredentialsDevice] = useState<Device | null>(
    null,
  );
  const [credentialsOpen, setCredentialsOpen] = useState(false);

  // Add Device dialog
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);

  // Import
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);

        // Detect bundle (has "device" key) vs plain device JSON
        const isBundle = json.device !== undefined;
        const deviceData = isBundle ? json.device : json;

        // Strip server-generated and tenant-specific fields
        const {
          id,
          createdTime,
          tenantId,
          customerId,
          deviceProfileId,
          ownerId,
          externalId,
          deviceProfileName,
          version,
          active,
          customerIsPublic,
          customerTitle,
          type: _legacyType,
          ...payload
        } = deviceData;

        const created = await DeviceService.createDevice(payload);
        const deviceId = created.id?.id ?? "";

        if (isBundle) {
          // Restore server attributes
          if (
            Array.isArray(json.serverAttributes) &&
            json.serverAttributes.length > 0
          ) {
            const record = Object.fromEntries(
              json.serverAttributes.map(({ key, value }: any) => [key, value]),
            );
            await DeviceService.updateDeviceServerAttributes(deviceId, record);
          }
          // Restore shared attributes
          if (
            Array.isArray(json.sharedAttributes) &&
            json.sharedAttributes.length > 0
          ) {
            const record = Object.fromEntries(
              json.sharedAttributes.map(({ key, value }: any) => [key, value]),
            );
            await DeviceService.updateDeviceSharedAttributes(deviceId, record);
          }
          // Restore latest telemetry
          if (json.telemetry && Object.keys(json.telemetry).length > 0) {
            const telemetryRecord = Object.fromEntries(
              Object.entries(json.telemetry).map(
                ([key, points]: [string, any]) => [
                  key,
                  Array.isArray(points) && points.length > 0
                    ? points[0].value
                    : null,
                ],
              ),
            );
            await DeviceService.addDeviceLatestTelemetry(
              deviceId,
              telemetryRecord,
            );
          }
          // Restore calculated fields
          if (
            Array.isArray(json.calculatedFields) &&
            json.calculatedFields.length > 0
          ) {
            for (const field of json.calculatedFields) {
              const {
                id: _fid,
                createdTime: _fct,
                version: _fv,
                ...fieldPayload
              } = field;
              // Strip refEntityId from arguments that reference external entities
              // (only "current_entity" references are safe to carry over)
              if (Array.isArray(fieldPayload.arguments)) {
                fieldPayload.arguments = fieldPayload.arguments.map(
                  (arg: any) => {
                    if (arg.entityType !== "current_entity") {
                      const { refEntityId: _ref, ...safeArg } = arg;
                      return safeArg;
                    }
                    return arg;
                  },
                );
              }
              await DeviceService.createDeviceCalculatedField(
                deviceId,
                fieldPayload,
              );
            }
          }
        }

        toast.success(`Device "${payload.name ?? file.name}" imported`);
        mutate();
      } catch (error: any) {
        const message =
          error?.response?.data?.message ??
          "Failed to import device – invalid JSON file";
        toast.error(message);
      } finally {
        if (importFileInputRef.current) importFileInputRef.current.value = "";
      }
    },
    [mutate],
  );

  const importAction = (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => importFileInputRef.current?.click()}
              className="text-muted-foreground hover:text-foreground"
            >
              <Upload className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Import device from JSON</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <input
        ref={importFileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImport}
      />
    </>
  );

  // Side panel
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const handleAddDeviceSubmit = useCallback(
    async (deviceData: any) => {
      try {
        await DeviceService.createDevice(deviceData);
        toast.success(`Device "${deviceData.name}" created successfully`);
        setAddDeviceOpen(false);
        mutate();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to create device");
        throw err;
      }
    },
    [mutate],
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSortChange = useCallback(
    (property: string, order: "ASC" | "DESC") => {
      setSortProperty(property);
      setSortOrder(order);
      setCurrentPage(0);
    },
    [],
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
        toast.error(
          err?.response?.data?.message || "Failed to make device public",
        );
      }
    },
    [mutate],
  );

  const handleMakePrivate = useCallback(
    async (device: Device) => {
      try {
        await DeviceService.makeDevicePrivate(device.id?.id ?? "");
        toast.success(`"${device.name}" is now private`);
        mutate();
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || "Failed to make device private",
        );
      }
    },
    [mutate],
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
    [mutate],
  );

  const handleExport = useCallback(async (device: Device) => {
    try {
      const id = device.id?.id ?? "";
      const {
        id: _id,
        createdTime,
        tenantId,
        customerId,
        ownerId,
        externalId,
        deviceProfileId,
        deviceProfileName: _dpName,
        version: _version,
        active: _active,
        customerIsPublic: _customerIsPublic,
        customerTitle: _customerTitle,
        type: _legacyType,
        ...devicePayload
      } = device as any;

      const [serverAttrs, sharedAttrs, calcFieldsResp, telemetryKeys] =
        await Promise.all([
          DeviceService.fetchDeviceServerAttributes(id),
          DeviceService.fetchDeviceSharedAttributes(id),
          DeviceService.fetchDeviceCalculatedFields(id, 0, 1000),
          DeviceService.fetchDeviceLatestTelemetryKeys(id),
        ]);

      const telemetry =
        telemetryKeys.length > 0
          ? await DeviceService.fetchDeviceLatestTelemetry(id, telemetryKeys)
          : {};

      const bundle = {
        device: devicePayload,
        serverAttributes: serverAttrs,
        sharedAttributes: sharedAttrs,
        telemetry,
        calculatedFields: calcFieldsResp.data,
      };

      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${device.name ?? "device"}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export device");
    }
  }, []);

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
        onAdd={() => setAddDeviceOpen(true)}
        onMakePublic={handleMakePublic}
        onMakePrivate={handleMakePrivate}
        onAssignToCustomer={handleAssignToCustomer}
        onManageCredentials={handleManageCredentials}
        onDelete={handleDelete}
        onExport={handleExport}
        customAction={importAction}
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
