"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import {
  TimeWindowPicker,
  TimeWindowValue,
} from "@/components/molecules/TimeWindowPicker";
import { useAuditLogs } from "@/hooks/thingsboard/audit-logs/useAuditLogs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface AuditLogEntry {
  id: { id: string };
  createdTime: number;
  entityId: { entityType: string; id: string };
  entityName: string;
  userId: { id: string };
  userName: string;
  actionType: string;
  actionData: any;
  actionStatus: string;
  actionFailureDetails: string;
}

// ─── Action status badge ────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const isSuccess = status === "SUCCESS";
  return (
    <Badge
      className={`text-xs font-medium ${
        isSuccess
          ? "border border-emerald-200 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "border border-red-200 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

// ─── JSON viewer dialog ─────────────────────────────────────────────────────
function AuditLogDetailsDialog({
  log,
  onClose,
}: {
  log: AuditLogEntry | null;
  onClose: () => void;
}) {
  if (!log) return null;
  const json = JSON.stringify(log.actionData, null, 2);

  // Syntax highlight helper
  const highlighted = json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-amber-600 dark:text-amber-400"; // number / bool / null
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-rose-600 dark:text-rose-400"; // key
        } else {
          cls = "text-emerald-600 dark:text-emerald-400"; // string value
        }
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );

  return (
    <Dialog open={!!log} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-135 max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="border-b border-border bg-muted/30 px-6 py-4">
          <DialogTitle className="text-foreground">
            Audit log details
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Action data
          </p>
          <div className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-4">
            <pre
              className="whitespace-pre text-xs font-mono leading-relaxed text-foreground"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </div>
        </div>
        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page component ────────────────────────────────────────────────────
const PAGE_SIZE = 10;

export default function AuditLogsPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Default to "last 1 day"
  const [timeWindow, setTimeWindow] = useState<TimeWindowValue>({
    mode: "last",
    lastMs: 86400000,
    lastLabel: "1 day",
  });

  // Store computed timestamps to avoid infinite queries caused by Date.now() in render
  const [timestamps, setTimestamps] = useState<{
    startTime: number;
    endTime: number;
  }>(() => {
    const end = Date.now();
    const start = end - 86400000;
    return { startTime: start, endTime: end };
  });

  const { logs, totalPages, totalElements, isLoading, mutate } = useAuditLogs(
    { startTime: timestamps.startTime, endTime: timestamps.endTime },
    currentPage,
    PAGE_SIZE,
    sortProperty,
    sortOrder,
  );

  const handleTimeWindowChange = (val: TimeWindowValue) => {
    setTimeWindow(val);

    let start = 0;
    let end = Date.now();
    if (val.mode === "last") {
      start = end - (val.lastMs ?? 86400000);
    } else if (val.mode === "range" || val.mode === "relative") {
      start = val.startTime?.getTime() ?? end - 86400000;
      end = val.endTime?.getTime() ?? end;
    }

    setTimestamps({ startTime: start, endTime: end });
    setCurrentPage(0);
  };

  const handleSortChange = (property: string, order: "ASC" | "DESC") => {
    setSortProperty(property);
    setSortOrder(order);
    setCurrentPage(0);
  };

  const formatTimestamp = (ms: number) => {
    return new Date(ms).toLocaleString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const columns: DataTableColumn<AuditLogEntry>[] = [
    {
      key: "createdTime",
      header: "Timestamp",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-foreground">
          {formatTimestamp(item.createdTime)}
        </span>
      ),
    },
    {
      key: "entityType",
      header: "Entity type",
      render: (item) => (
        <span className="text-sm font-medium text-primary">
          {item.entityId.entityType.charAt(0) +
            item.entityId.entityType.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      key: "entityName",
      header: "Entity name",
      render: (item) => (
        <span className="text-sm text-foreground">{item.entityName}</span>
      ),
    },
    {
      key: "userName",
      header: "User",
      render: (item) => (
        <span className="text-sm text-primary">{item.userName}</span>
      ),
    },
    {
      key: "actionType",
      header: "Type",
      render: (item) => (
        <span className="text-sm text-foreground">
          {item.actionType.charAt(0) + item.actionType.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      key: "actionStatus",
      header: "Status",
      render: (item) => <StatusBadge status={item.actionStatus} />,
    },
    {
      key: "details",
      header: "Details",
      render: (item) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(item);
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Audit Logs"
        data={logs}
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
        onRowClick={(item) => setSelectedLog(item)}
        emptyMessage="No audit log entries found for the selected time window."
        filterComponent={
          <TimeWindowPicker
            value={timeWindow}
            onChange={handleTimeWindowChange}
          />
        }
      />

      <AuditLogDetailsDialog
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
