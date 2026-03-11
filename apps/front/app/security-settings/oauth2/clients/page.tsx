"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { useOAuth2ClientInfos } from "@/hooks/thingsboard/oauth2/useOAuth2ClientInfos";
import { OAuth2ClientInfo } from "@/lib/services/thingsboardServices/oauth2Service";
import { useAppSelector } from "@/lib/redux/store";
import { AddOAuth2ClientModal } from "@/components/organisms/AddOAuth2ClientModal";
import { OAuth2ClientDetailPanel } from "@/components/organisms/OAuth2ClientDetailPanel";

const PAGE_SIZE = 10;

// ─── Tab nav ────────────────────────────────────────────────────────────────
function OAuth2Tabs() {
    const pathname = usePathname();
    const role = useAppSelector((state) => state.user.user?.role);

    const tabs: { label: string; href: string }[] = [];

    if (role === "ADMIN") {
        tabs.push({ label: "Domains", href: "/security-settings/oauth2/domains" });
        tabs.push({ label: "OAuth 2.0 clients", href: "/security-settings/oauth2/clients" });
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
                            className={`relative px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${isActive
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

export default function OAuth2ClientsPage() {
    const [currentPage, setCurrentPage] = useState(0);
    const [sortProperty, setSortProperty] = useState("createdTime");
    const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<OAuth2ClientInfo | null>(null);

    const { clients, totalPages, totalElements, isLoading, mutate } = useOAuth2ClientInfos(
        currentPage,
        PAGE_SIZE,
        sortProperty,
        sortOrder,
    );

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

    const columns: DataTableColumn<OAuth2ClientInfo>[] = [
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
            key: "title",
            header: "Title",
            render: (item) => (
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {item.title}
                </span>
            ),
        },
        {
            key: "platforms",
            header: "Allowed platforms",
            render: (item) => (
                <span className="text-sm text-slate-700 dark:text-slate-300">
                    {item.platforms && item.platforms.length > 0
                        ? item.platforms
                            .map((p) => (p === "IOS" ? "iOS" : p.charAt(0) + p.slice(1).toLowerCase()))
                            .join(", ")
                        : "—"}
                </span>
            ),
        },
    ];

    return (
        <div className="p-6">
            <OAuth2Tabs />

            <DataTable
                title="OAuth 2.0 clients"
                data={clients}
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
                onRowClick={(item) => setSelectedClient(item)}
                emptyMessage="No OAuth 2.0 clients configured yet."
                addButtonLabel="Add"
            />

            <AddOAuth2ClientModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onSuccess={() => mutate()}
            />

            <OAuth2ClientDetailPanel
                client={selectedClient}
                onClose={() => setSelectedClient(null)}
                onSaveSuccess={() => {
                    mutate();
                    setSelectedClient(null);
                }}
            />
        </div>
    );
}
