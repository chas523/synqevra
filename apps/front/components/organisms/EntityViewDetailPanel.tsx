"use client";

import { useMemo, useState } from "react";
import {
  EntityDetailPanel,
  TabConfig,
} from "@/components/templates/EntityDetailPanel";
import type { EntityView } from "@/types/thingsboardEntityViewTypes";
import { EntityViewDetailsTabContent } from "./EntityViewDetailsTabContent";
import { EntityViewAttributesTabContent } from "./EntityViewAttributesTabContent";
import { EntityViewLatestTelemetryTabContent } from "./EntityViewLatestTelemetryTabContent";
import { EntityViewAlarmsTabContent } from "./EntityViewAlarmsTabContent";
import { EntityViewEventsTabContent } from "./EntityViewEventsTabContent";
import { EntityViewRelationsTabContent } from "./EntityViewRelationsTabContent";
import { EntityViewAuditLogsTabContent } from "./EntityViewAuditLogsTabContent";
import { VersionsTable } from "./VersionsTable";

export interface EntityViewDetailPanelProps {
  entityView: EntityView | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function EntityViewDetailPanel({
  entityView,
  isOpen,
  onClose,
}: EntityViewDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [branch, setBranch] = useState("main");

  const tabs: TabConfig[] = useMemo(() => {
    if (!entityView) return [];

    const entityViewId = entityView.id?.id ?? "";

    return [
      {
        id: "details",
        label: "Details",
        content: <EntityViewDetailsTabContent entityViewId={entityViewId} />,
      },
      {
        id: "attributes",
        label: "Attributes",
        content: <EntityViewAttributesTabContent entityViewId={entityViewId} />,
      },
      {
        id: "telemetry",
        label: "Latest telemetry",
        content: (
          <EntityViewLatestTelemetryTabContent entityViewId={entityViewId} />
        ),
      },
      {
        id: "alarms",
        label: "Alarms",
        content: <EntityViewAlarmsTabContent entityViewId={entityViewId} />,
      },
      {
        id: "events",
        label: "Events",
        content: <EntityViewEventsTabContent entityViewId={entityViewId} />,
      },
      {
        id: "relations",
        label: "Relations",
        content: <EntityViewRelationsTabContent entityViewId={entityViewId} />,
      },
      {
        id: "audit-logs",
        label: "Audit logs",
        content: <EntityViewAuditLogsTabContent entityViewId={entityViewId} />,
      },
      {
        id: "version-control",
        label: "Version control",
        content: (
          <VersionsTable
            branch={branch}
            onBranchChange={setBranch}
            entityType="ENTITY_VIEW"
            entityId={entityViewId}
            hideCard={true}
          />
        ),
      },
    ];
  }, [entityView, branch]);

  if (!entityView) return null;

  return (
    <EntityDetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={entityView.name}
      subtitle={`Type: ${entityView.type || "-"}`}
      tabs={tabs}
      defaultTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
