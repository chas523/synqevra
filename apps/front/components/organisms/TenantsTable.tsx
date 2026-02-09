"use client";

import type { Tenant } from "@/lib/types/dashboardTypes";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface TenantsTableProps {
    tenants: Tenant[];
    isLoading: boolean;
    selectedTenantId: string | null;
    onSelectTenant: (tenant: Tenant) => void;
    className?: string;
}

function formatDate(timestamp?: number): string {
    if (!timestamp) return "—";
    const date = new Date(timestamp);
    return date.toLocaleString("pl-PL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export function TenantsTable({
    tenants,
    isLoading,
    selectedTenantId,
    onSelectTenant,
    className,
}: TenantsTableProps) {
    if (isLoading) {
        return (
            <div className={cn("bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/50", className)}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12" />
                            <TableHead>Stworzony czas ↓</TableHead>
                            <TableHead>Tytuł</TableHead>
                            <TableHead>Profil tenanta</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={`skeleton-${i}`}>
                                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (tenants.length === 0) {
        return (
            <div className={cn("bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/50 p-8 text-center", className)}>
                <p className="text-slate-500 dark:text-slate-400">Brak tenantów do wyświetlenia</p>
            </div>
        );
    }

    return (
        <div className={cn("bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden", className)}>
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="w-12" />
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            Stworzony czas ↓
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            Tytuł
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            Profil tenanta
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tenants.map((tenant) => {
                        const isSelected = selectedTenantId === tenant.id.id;
                        return (
                            <TableRow
                                key={tenant.id.id}
                                onClick={() => onSelectTenant(tenant)}
                                className={cn(
                                    "cursor-pointer transition-colors",
                                    isSelected
                                        ? "bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <TableCell>
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => onSelectTenant(tenant)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </TableCell>
                                <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                    {formatDate(tenant.createdTime)}
                                </TableCell>
                                <TableCell className="font-medium text-slate-900 dark:text-white">
                                    {tenant.title}
                                </TableCell>
                                <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                    {tenant.tenantProfileId?.name || "—"}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
