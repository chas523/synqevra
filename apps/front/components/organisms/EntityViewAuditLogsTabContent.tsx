"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import {
  TimeRangeFilter,
  TimeRange,
} from "@/components/molecules/TimeRangeFilter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  EntityViewAuditLog,
  EntityViewService,
} from "@/lib/services/thingsboardServices/entityViewService";

interface EntityViewAuditLogsTabContentProps {
  entityViewId: string;
}

export function EntityViewAuditLogsTabContent({
  entityViewId,
}: EntityViewAuditLogsTabContentProps) {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>({ type: "ALL_TIME" });
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<string>("{}");

  const { data, isLoading, mutate } = useSWR(
    entityViewId
      ? [
          "entityViewAuditLogs",
          entityViewId,
          page,
          pageSize,
          timeRange.startTime,
          timeRange.endTime,
        ]
      : null,
    () =>
      EntityViewService.getEntityViewAuditLogs(
        entityViewId,
        page,
        pageSize,
        "createdTime",
        "DESC",
        timeRange.startTime,
        timeRange.endTime,
      ),
  );

  const handleOpenDetails = useCallback((row: EntityViewAuditLog) => {
    const hasActionData = !!row.actionData;
    const hasFailureDetails = !!row.actionFailureDetails;

    if (!hasActionData && !hasFailureDetails) return;

    if (hasActionData) {
      setSelectedDetails(JSON.stringify(row.actionData, null, 2));
    } else {
      setSelectedDetails(row.actionFailureDetails || "");
    }

    setDetailsDialogOpen(true);
  }, []);

  const columns: DataTableColumn<EntityViewAuditLog>[] = useMemo(
    () => [
      {
        key: "createdTime",
        header: "Created time",
        render: (row) => new Date(row.createdTime).toLocaleString(),
      },
      {
        key: "actionType",
        header: "Action",
      },
      {
        key: "actionStatus",
        header: "Status",
      },
      {
        key: "userName",
        header: "User",
        render: (row) => row.userName || "-",
      },
      {
        key: "entityName",
        header: "Entity",
        render: (row) => row.entityName || "-",
      },
      {
        key: "actionData",
        header: "Details",
        render: (row) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenDetails(row)}
            disabled={!row.actionData && !row.actionFailureDetails}
          >
            Show details
          </Button>
        ),
      },
    ],
    [handleOpenDetails],
  );

  const filteredAuditLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return data?.data || [];
    }

    return (data?.data || []).filter((row) => {
      const action = String(row.actionType || "").toLowerCase();
      const status = String(row.actionStatus || "").toLowerCase();
      const user = String(row.userName || "").toLowerCase();
      const entity = String(row.entityName || "").toLowerCase();

      return (
        action.includes(query) ||
        status.includes(query) ||
        user.includes(query) ||
        entity.includes(query)
      );
    });
  }, [data?.data, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <TimeRangeFilter
          value={timeRange}
          onChange={(range) => {
            setTimeRange(range);
            setPage(0);
          }}
        />
      </div>

      <DataTable
        title="Audit logs"
        data={filteredAuditLogs}
        columns={columns}
        getRowId={(row) =>
          row.id?.id ||
          `${row.createdTime}-${row.actionType}-${row.userName || "unknown"}`
        }
        isLoading={isLoading}
        currentPage={isSearching ? 0 : page}
        pageSize={isSearching ? filteredAuditLogs.length || 10 : pageSize}
        totalPages={isSearching ? 1 : data?.totalPages || 0}
        totalElements={
          isSearching ? filteredAuditLogs.length : data?.totalElements || 0
        }
        onPageChange={isSearching ? () => {} : setPage}
        onRefresh={() => mutate()}
        filterComponent={
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="w-full sm:w-64">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search audit log..."
              />
            </div>
          </div>
        }
        emptyMessage={
          isSearching
            ? "No audit logs match your search."
            : "No audit logs found for this entity view."
        }
        loadingMessage="Loading audit logs..."
      />

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-170">
          <DialogHeader>
            <DialogTitle>Audit log details</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <div className="text-sm font-medium text-slate-600">
              Action data
            </div>
            <pre className="max-h-90 overflow-auto rounded border bg-slate-50 p-3 text-xs font-mono text-slate-700">
              {selectedDetails}
            </pre>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
