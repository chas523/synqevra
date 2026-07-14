"use client";

import { useMemo, useState } from "react";
import {
  EntityDetailPanel,
  TabConfig,
} from "@/components/templates/EntityDetailPanel";
import type { DeviceProfile } from "@/lib/services/thingsboardServices/deviceService";
import { DeviceProfileDetailsTabContent } from "./DeviceProfileDetailsTabContent";
import { DeviceProfileTransportTabContent } from "./DeviceProfileTransportTabContent";
import { DeviceProfileCalculatedFieldsTabContent } from "./DeviceProfileCalculatedFieldsTabContent";
import { DeviceProfileAlarmRulesTabContent } from "./DeviceProfileAlarmRulesTabContent";
import { DeviceProfileProvisioningTabContent } from "./DeviceProfileProvisioningTabContent";
import { DeviceProfileAuditLogsTabContent } from "./DeviceProfileAuditLogsTabContent";
import { VersionsTable } from "./VersionsTable";

interface DeviceProfileDetailPanelProps {
  profile: DeviceProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceProfileDetailPanel({
  profile,
  isOpen,
  onClose,
}: DeviceProfileDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [branch, setBranch] = useState("main");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const tabs: TabConfig[] = useMemo(() => {
    if (!profile) {
      return [];
    }

    const profileId = profile.id?.id ?? "";

    return [
      {
        id: "details",
        label: "Details",
        content: <DeviceProfileDetailsTabContent profileId={profileId} />,
      },
      {
        id: "transport-configuration",
        label: "Transport configuration",
        content: <DeviceProfileTransportTabContent profileId={profileId} />,
      },
      {
        id: "calculated-fields",
        label: "Calculated fields",
        content: (
          <DeviceProfileCalculatedFieldsTabContent profileId={profileId} />
        ),
      },
      {
        id: "alarm-rules",
        label: "Alarm rules",
        content: <DeviceProfileAlarmRulesTabContent profileId={profileId} />,
      },
      {
        id: "device-provisioning",
        label: "Device provisioning",
        content: <DeviceProfileProvisioningTabContent profileId={profileId} />,
      },
      {
        id: "audit-logs",
        label: "Audit logs",
        content: <DeviceProfileAuditLogsTabContent profileId={profileId} />,
      },
      {
        id: "version-control",
        label: "Version control",
        content: (
          <VersionsTable
            branch={branch}
            onBranchChange={setBranch}
            entityType="DEVICE_PROFILE"
            entityId={profileId}
            hideCard={true}
          />
        ),
      },
    ];
  }, [profile, branch]);

  if (!profile) {
    return null;
  }

  return (
    <EntityDetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={profile.name}
      subtitle={`Type: ${profile.type} | Transport: ${profile.transportType}`}
      tabs={tabs}
      defaultTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
}
