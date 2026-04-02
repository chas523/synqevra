"use client";

import { useMemo, useState } from "react";
import {
  EntityDetailPanel,
  TabConfig,
} from "@/components/templates/EntityDetailPanel";
import type { AssetProfile } from "@/types/thingsboardAssetTypes";
import { AssetProfileDetailsTabContent } from "./AssetProfileDetailsTabContent";
import { DeviceProfileCalculatedFieldsTabContent } from "./DeviceProfileCalculatedFieldsTabContent";
import { DeviceProfileAuditLogsTabContent } from "./DeviceProfileAuditLogsTabContent";

interface AssetProfileDetailPanelProps {
  profile: AssetProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssetProfileDetailPanel({
  profile,
  isOpen,
  onClose,
}: AssetProfileDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("details");

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
        content: <AssetProfileDetailsTabContent profileId={profileId} />,
      },
      {
        id: "calculated-fields",
        label: "Calculated fields",
        content: (
          <DeviceProfileCalculatedFieldsTabContent
            profileId={profileId}
            entityType="assetProfile"
          />
        ),
      },
      {
        id: "audit-logs",
        label: "Audit logs",
        content: (
          <DeviceProfileAuditLogsTabContent
            profileId={profileId}
            entityType="assetProfile"
          />
        ),
      },
      {
        id: "version-control",
        label: "Version control",
        content: (
          <div className="p-4 text-center text-slate-500">
            Version control coming soon
          </div>
        ),
      },
    ];
  }, [profile]);

  if (!profile) {
    return null;
  }

  return (
    <EntityDetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={profile.name}
      subtitle={`Type: ${profile.type || "DEFAULT"}`}
      tabs={tabs}
      defaultTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
}
