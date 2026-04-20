"use client";

import { useMemo, useState } from "react";
import {
  EntityDetailPanel,
  TabConfig,
} from "@/components/templates/EntityDetailPanel";
import { DeviceDetailsTabContent } from "./DeviceDetailsTabContent";
import { DeviceAttributesTabContent } from "./DeviceAttributesTabContent";
import { DeviceLatestTelemetryTabContent } from "./DeviceLatestTelemetryTabContent";
import { DeviceCalculatedFieldsTabContent } from "./DeviceCalculatedFieldsTabContent";
import { DeviceAlarmsTabContent } from "./DeviceAlarmsTabContent";
import { DeviceEventsTabContent } from "./DeviceEventsTabContent";
import { DeviceRelationsTabContent } from "./DeviceRelationsTabContent";
import { DeviceAuditLogsTabContent } from "./DeviceAuditLogsTabContent";
import { VersionsTable } from "./VersionsTable";
import type { Device } from "@/types/thingsboardDeviceTypes";

export interface DeviceDetailPanelProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function DeviceDetailPanel({
  device,
  isOpen,
  onClose,
  onRefresh,
}: DeviceDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [branch, setBranch] = useState("main");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const tabs: TabConfig[] = useMemo(() => {
    if (!device) return [];

    return [
      {
        id: "details",
        label: "Details",
        content: <DeviceDetailsTabContent deviceId={device.id?.id ?? ""} />,
      },
      {
        id: "attributes",
        label: "Attributes",
        content: <DeviceAttributesTabContent deviceId={device.id?.id ?? ""} />,
      },
      {
        id: "telemetry",
        label: "Latest telemetry",
        content: (
          <DeviceLatestTelemetryTabContent deviceId={device.id?.id ?? ""} />
        ),
      },
      {
        id: "calculated-fields",
        label: "Calculated fields",
        content: (
          <DeviceCalculatedFieldsTabContent deviceId={device.id?.id ?? ""} />
        ),
      },
      {
        id: "alarms",
        label: "Alarms",
        content: <DeviceAlarmsTabContent deviceId={device.id?.id ?? ""} />,
      },
      {
        id: "events",
        label: "Events",
        content: <DeviceEventsTabContent deviceId={device.id?.id ?? ""} />,
      },
      {
        id: "relations",
        label: "Relations",
        content: <DeviceRelationsTabContent deviceId={device.id?.id ?? ""} />,
      },
      {
        id: "audit-logs",
        label: "Audit logs",
        content: <DeviceAuditLogsTabContent deviceId={device.id?.id ?? ""} />,
      },
      {
        id: "version-control",
        label: "Version control",
        content: (
          <VersionsTable
            branch={branch}
            onBranchChange={setBranch}
            entityType="DEVICE"
            entityId={device.id?.id ?? ""}
            hideCard={true}
          />
        ),
      },
    ];
  }, [device, branch]);

  if (!device) return null;

  return (
    <EntityDetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={device.name}
      subtitle={`Device Profile: ${device.deviceProfileName}`}
      tabs={tabs}
      defaultTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
}
