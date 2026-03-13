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
import {
  AssetAuditLog,
  AssetService,
} from "@/lib/services/thingsboardServices/assetService";

interface AssetAuditLogsTabContentProps {
  assetId: string;
}

export function AssetAuditLogsTabContent({
  assetId,
}: AssetAuditLogsTabContentProps) {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [timeRange, setTimeRange] = useState<TimeRange>({ type: "ALL_TIME" });
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<string>("{}");

  const { data, isLoading, mutate } = useSWR(
    assetId
      ? [
          "AssetAuditLogs",
          assetId,
          page,
          pageSize,
          timeRange.startTime,
          timeRange.endTime,
        ]
      : null,
    () =>
      AssetService.getAssetAuditLogs(
        assetId,
        page,
        pageSize,
        "createdTime",
        "DESC",
        timeRange.startTime,
        timeRange.endTime,
      ),
  );

  const handlePageChange = useCallback(
    (newPage: number) => setPage(newPage),
    [],
  );
  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
    setPage(0);
  }, []);

  const handleOpenDetails = useCallback((row: AssetAuditLog) => {
    const hasActionData = !!row.actionData;
    const hasFailureDetails = !!row.actionFailureDetails;

    if (!hasActionData && !hasFailureDetails) {
      return;
    }

    if (hasActionData) {
      setSelectedDetails(JSON.stringify(row.actionData, null, 2));
    } else {
      setSelectedDetails(row.actionFailureDetails || "");
    }

    setDetailsDialogOpen(true);
  }, []);

  const columns: DataTableColumn<AssetAuditLog>[] = useMemo(
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
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <TimeRangeFilter value={timeRange} onChange={handleTimeRangeChange} />
      </div>

      <DataTable
        title="Audit logs"
        data={data?.data || []}
        columns={columns}
        getRowId={(row) =>
          row.id?.id ||
          `${row.createdTime}-${row.actionType}-${row.userName || "unknown"}`
        }
        isLoading={isLoading}
        currentPage={page}
        pageSize={pageSize}
        totalPages={data?.totalPages || 0}
        totalElements={data?.totalElements || 0}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        emptyMessage="No audit logs found for this asset."
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
