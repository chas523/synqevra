"use client";

import { useMemo, useState } from "react";
import { EntityDetailPanel, TabConfig } from "@/components/templates/EntityDetailPanel";
import { AssetDetailsTabContent } from "./AssetDetailsTabContent";
import { AssetAttributesTabContent } from "./AssetAttributesTabContent";
import { AssetLatestTelemetryTabContent } from "./AssetLatestTelemetryTabContent";
import { AssetCalculatedFieldsTabContent } from "./AssetCalculatedFieldsTabContent";
import { AssetAlarmsTabContent } from "./AssetAlarmsTabContent";
import { AssetEventsTabContent } from "./AssetEventsTabContent";
import { AssetRelationsTabContent } from "./AssetRelationsTabContent";
import { AssetAuditLogsTabContent } from "./AssetAuditLogsTabContent";
import type { Asset } from "@/types/thingsboardAssetTypes";

export interface AssetDetailPanelProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function AssetDetailPanel({
  asset,
  isOpen,
  onClose,
}: AssetDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("details");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const tabs: TabConfig[] = useMemo(() => {
    if (!asset) return [];

    return [
      {
        id: "details",
        label: "Details",
        content: <AssetDetailsTabContent assetId={asset.id?.id ?? ""} />,
      },
      {
        id: "attributes",
        label: "Attributes",
        content: <AssetAttributesTabContent assetId={asset.id?.id ?? ""} />,
      },
      {
        id: "telemetry",
        label: "Latest telemetry",
        content: <AssetLatestTelemetryTabContent assetId={asset.id?.id ?? ""} />,
      },
      {
        id: "calculated-fields",
        label: "Calculated fields",
        content: <AssetCalculatedFieldsTabContent assetId={asset.id?.id ?? ""} />,
      },
      {
        id: "alarms",
        label: "Alarms",
        content: <AssetAlarmsTabContent assetId={asset.id?.id ?? ""} />,
      },
      {
        id: "events",
        label: "Events",
        content: <AssetEventsTabContent assetId={asset.id?.id ?? ""} />,
      },
      {
        id: "relations",
        label: "Relations",
        content: <AssetRelationsTabContent assetId={asset.id?.id ?? ""} />,
      },
      {
        id: "audit-logs",
        label: "Audit logs",
        content: <AssetAuditLogsTabContent assetId={asset.id?.id ?? ""} />,
      },
      {
        id: "version-control",
        label: "Version control",
        content: <div className="p-4 text-center text-slate-500">Version control coming soon</div>,
      },
    ];
  }, [asset]);

  if (!asset) return null;

  return (
    <EntityDetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={asset.name}
      subtitle={`Asset Profile: ${asset.assetProfileName || "-"}`}
      tabs={tabs}
      defaultTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
}
