"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { useDomainInfos } from "@/hooks/thingsboard/oauth2/useDomainInfos";
import {
  DomainInfo,
  OAuth2ClientInfo,
} from "@/lib/services/thingsboardServices/oauth2Service";
import { AddDomainModal } from "@/components/organisms/AddDomainModal";
import { DomainDetailPanel } from "@/components/organisms/DomainDetailPanel";
import { useAppSelector } from "@/lib/redux/store";

const PAGE_SIZE = 10;

// ─── Tab nav ────────────────────────────────────────────────────────────────
function OAuth2Tabs() {
  const pathname = usePathname();
  const role = useAppSelector((state) => state.user.user?.role);

  const tabs: { label: string; href: string }[] = [];

  if (role === "ADMIN") {
    tabs.push({ label: "Domains", href: "/security-settings/oauth2/domains" });
    tabs.push({
      label: "OAuth 2.0 clients",
      href: "/security-settings/oauth2/clients",
    });
  }

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
      <nav className="flex gap-0">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={false}
              className={`relative px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                isActive
                  ? "border-[#2a456c] dark:border-blue-400 text-[#2a456c] dark:text-blue-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// ─── OAuth2 clients chips ───────────────────────────────────────────────────
function OAuth2ClientChips({ clients }: { clients: OAuth2ClientInfo[] }) {
  if (!clients || clients.length === 0)
    return (
      <span className="text-slate-400 dark:text-slate-500 text-sm">—</span>
    );
  return (
    <div className="flex flex-wrap gap-1">
      {clients.map((c) => (
        <span
          key={c.id.id}
          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium"
        >
          {c.title}
        </span>
      ))}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function DomainsPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<DomainInfo | null>(null);

  const { domains, totalPages, totalElements, isLoading, mutate } =
    useDomainInfos(currentPage, PAGE_SIZE, sortProperty, sortOrder);

  const handleSortChange = (property: string, order: "ASC" | "DESC") => {
    setSortProperty(property);
    setSortOrder(order);
    setCurrentPage(0);
  };

  const formatTimestamp = (ms: number) =>
    new Date(ms).toLocaleString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const columns: DataTableColumn<DomainInfo>[] = [
    {
      key: "createdTime",
      header: "Created time",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-slate-900 dark:text-slate-100">
          {formatTimestamp(item.createdTime)}
        </span>
      ),
    },
    {
      key: "name",
      header: "Domain name",
      render: (item) => (
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
          {item.name}
        </span>
      ),
    },
    {
      key: "oauth2ClientInfos",
      header: "OAuth 2.0 clients",
      render: (item) => <OAuth2ClientChips clients={item.oauth2ClientInfos} />,
    },
  ];

  return (
    <div className="p-6">
      <OAuth2Tabs />

      <DataTable
        title="Domains"
        data={domains}
        columns={columns}
        getRowId={(item) => item.id.id}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onRefresh={() => mutate()}
        onAdd={() => setIsAddModalOpen(true)}
        onRowClick={(item) => setSelectedDomain(item)}
        emptyMessage="No domains configured yet."
        addButtonLabel="Add domain"
      />

      <AddDomainModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={() => mutate()}
      />

      <DomainDetailPanel
        domain={selectedDomain}
        onClose={() => setSelectedDomain(null)}
        onSaveSuccess={() => {
          mutate();
          setSelectedDomain(null);
        }}
      />
    </div>
  );
}
