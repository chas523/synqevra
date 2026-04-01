"use client";

import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/molecules/CopyButton";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";

interface CustomerDetailsTabContentProps {
  customerId: string;
}

const formatDate = (timestamp?: number) => {
  if (!timestamp) {
    return "-";
  }

  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
};

const FieldBox = ({
  label,
  value,
  monospace = false,
}: {
  label: string;
  value?: string | number | null;
  monospace?: boolean;
}) => (
  <div className="space-y-1">
    <label className="ml-1 text-xs font-medium text-slate-500">{label}</label>
    <div
      className={[
        "rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
        monospace ? "font-mono text-slate-600" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {formatValue(value)}
    </div>
  </div>
);

export function CustomerDetailsTabContent({
  customerId,
}: CustomerDetailsTabContentProps) {
  const {
    data: customer,
    isLoading,
    error,
  } = useSWR(customerId ? ["customerDetails", customerId] : null, async () =>
    AssetService.fetchCustomer(customerId),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="ml-2">Loading customer details...</span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
        Failed to load customer details.
      </div>
    );
  }

  const isPublic =
    Boolean(customer.additionalInfo?.isPublic) ||
    (customer.title || customer.name || "").trim().toLowerCase() === "public";

  const customerName = customer.title || customer.name || "-";

  if (isPublic) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-sm font-semibold text-slate-900 dark:text-slate-200">
            General Info
          </h3>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">
              Name
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                {customerName}
              </div>
              <CopyButton
                value={customerName === "-" ? "" : customerName}
                size="icon"
                variant="ghost"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">
              Customer ID
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                {customer.id?.id || "-"}
              </div>
              <CopyButton
                value={customer.id?.id ?? ""}
                size="icon"
                variant="ghost"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Created time
            </label>
            <div className="text-sm text-slate-700 ml-1">
              {formatDate(customer.createdTime)}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Version
            </label>
            <div className="text-sm text-slate-700 ml-1">
              {String(customer.version ?? "-")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-sm font-semibold text-slate-900 dark:text-slate-200">
            General Info
          </h3>

          <div className="flex items-center gap-2">
            <Badge variant="outline">Customer</Badge>
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">
              Name
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                {customerName}
              </div>
              <CopyButton
                value={customerName === "-" ? "" : customerName}
                size="icon"
                variant="ghost"
              />
            </div>
          </div>

          <FieldBox label="Title" value={customer.title} />
          <FieldBox label="Email" value={customer.email} />
          <FieldBox label="Phone" value={customer.phone} />
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Created time
            </label>
            <div className="text-sm text-slate-700 ml-1">
              {formatDate(customer.createdTime)}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Version
            </label>
            <div className="text-sm text-slate-700 ml-1">
              {String(customer.version ?? "-")}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="border-b pb-2 text-sm font-semibold text-slate-900 dark:text-slate-200">
            Address & Identifiers
          </h3>

          <FieldBox label="Country" value={customer.country} />
          <FieldBox label="State" value={customer.state} />
          <FieldBox label="City" value={customer.city} />
          <FieldBox label="Address" value={customer.address} />
          <FieldBox label="Address 2" value={customer.address2} />
          <FieldBox label="ZIP" value={customer.zip} />
          <FieldBox label="Customer ID" value={customer.id?.id} monospace />
          <FieldBox label="Tenant ID" value={customer.tenantId?.id} monospace />
          <FieldBox label="External ID" value={customer.externalId} monospace />
        </div>
      </div>
    </div>
  );
}
