"use client";

import { useMemo, useState } from "react";
import {
  EntityDetailPanel,
  TabConfig,
} from "@/components/templates/EntityDetailPanel";
import { RuleChainDetailsTabContent } from "./RuleChainDetailsTabContent";
import { RuleChainAttributesTabContent } from "./RuleChainAttributesTabContent";
import { RuleChainAlarmsTabContent } from "./RuleChainAlarmsTabContent";
import { RuleChainEventsTabContent } from "./RuleChainEventsTabContent";
import { RuleChainRelationsTabContent } from "./RuleChainRelationsTabContent";
import { RuleChainAuditLogsTabContent } from "./RuleChainAuditLogsTabContent";
import { VersionsTable } from "./VersionsTable";
import type { RuleChain } from "@/lib/services/thingsboardServices/ruleChainService";

export interface RuleChainDetailPanelProps {
  ruleChain: RuleChain | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function RuleChainDetailPanel({
  ruleChain,
  isOpen,
  onClose,
  onRefresh,
}: RuleChainDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [branch, setBranch] = useState("main");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const tabs: TabConfig[] = useMemo(() => {
    if (!ruleChain) return [];

    return [
      {
        id: "details",
        label: "Details",
        content: (
          <RuleChainDetailsTabContent ruleChainId={ruleChain.id?.id ?? ""} />
        ),
      },
      {
        id: "attributes",
        label: "Attributes",
        content: (
          <RuleChainAttributesTabContent ruleChainId={ruleChain.id?.id ?? ""} />
        ),
      },
      {
        id: "alarms",
        label: "Alarms",
        content: (
          <RuleChainAlarmsTabContent ruleChainId={ruleChain.id?.id ?? ""} />
        ),
      },
      {
        id: "events",
        label: "Events",
        content: (
          <RuleChainEventsTabContent
            ruleChainId={ruleChain.id?.id ?? ""}
            tenantId={ruleChain.tenantId?.id}
          />
        ),
      },
      {
        id: "relations",
        label: "Relations",
        content: (
          <RuleChainRelationsTabContent ruleChainId={ruleChain.id?.id ?? ""} />
        ),
      },
      {
        id: "audit-logs",
        label: "Audit logs",
        content: (
          <RuleChainAuditLogsTabContent ruleChainId={ruleChain.id?.id ?? ""} />
        ),
      },
      {
        id: "version-control",
        label: "Version control",
        content: (
          <VersionsTable
            branch={branch}
            onBranchChange={setBranch}
            entityType="RULE_CHAIN"
            entityId={ruleChain.id?.id ?? ""}
            hideCard={true}
          />
        ),
      },
    ];
  }, [ruleChain, branch]);

  if (!ruleChain) return null;

  return (
    <EntityDetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={ruleChain.name}
      subtitle={`Type: ${ruleChain.type}`}
      tabs={tabs}
      defaultTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
}
