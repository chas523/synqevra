"use client";

import { useMemo, useState } from "react";
import {
  EntityDetailPanel,
  TabConfig,
} from "@/components/templates/EntityDetailPanel";
import type { CustomerInfo } from "@/types/thingsboardAssetTypes";
import { CustomerDetailsTabContent } from "./CustomerDetailsTabContent";
import { CustomerAttributesTabContent } from "./CustomerAttributesTabContent";
import { CustomerLatestTelemetryTabContent } from "./CustomerLatestTelemetryTabContent";
import { CustomerAlarmsTabContent } from "./CustomerAlarmsTabContent";
import { CustomerPlaceholderTabContent } from "./CustomerPlaceholderTabContent";

interface CustomerDetailPanelProps {
  customer: CustomerInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

const isPublicCustomer = (customer: CustomerInfo) => {
  if (customer.additionalInfo?.isPublic) {
    return true;
  }

  const title = (customer.title || customer.name || "").trim().toLowerCase();
  return title === "public";
};

export function CustomerDetailPanel({
  customer,
  isOpen,
  onClose,
}: CustomerDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("details");

  const tabs: TabConfig[] = useMemo(() => {
    if (!customer) {
      return [];
    }

    const id = customer.id?.id ?? "";

    return [
      {
        id: "details",
        label: "Details",
        content: <CustomerDetailsTabContent customerId={id} />,
      },
      {
        id: "attributes",
        label: "Attributes",
        content: <CustomerAttributesTabContent customerId={id} />,
      },
      {
        id: "latest-telemetry",
        label: "Latest Telemetry",
        content: <CustomerLatestTelemetryTabContent customerId={id} />,
      },
      {
        id: "alarms",
        label: "Alarms",
        content: <CustomerAlarmsTabContent customerId={id} />,
      },
      {
        id: "events",
        label: "Events",
        content: <CustomerPlaceholderTabContent title="Events" />,
      },
      {
        id: "relations",
        label: "Relations",
        content: <CustomerPlaceholderTabContent title="Relations" />,
      },
      {
        id: "audit-logs",
        label: "Audit logs",
        content: <CustomerPlaceholderTabContent title="Audit logs" />,
      },
      {
        id: "version-control",
        label: "Version control",
        content: <CustomerPlaceholderTabContent title="Version control" />,
      },
    ];
  }, [customer]);

  if (!customer) {
    return null;
  }

  const title = customer.title || customer.name || "Customer";
  const subtitle = isPublicCustomer(customer)
    ? "Type: Public customer"
    : "Type: Customer";

  return (
    <EntityDetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      tabs={tabs}
      defaultTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
