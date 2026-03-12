"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  AlarmFilters,
  AlarmStatus,
  AlarmSeverity,
} from "@/components/molecules/AlarmFilters";
import {
  TimeRangeFilter,
  TimeRange,
} from "@/components/molecules/TimeRangeFilter";

interface AssetAlarmsTabContentProps {
  assetId: string;
}

export function AssetAlarmsTabContent({ assetId }: AssetAlarmsTabContentProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusList, setStatusList] = useState<string[]>([]);
  const [severityList, setSeverityList] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>({ type: "ALL_TIME" });

  const { data, isLoading, mutate } = useSWR(
    assetId
      ? [
          "assetAlarms",
          assetId,
          page,
          pageSize,
          statusList.join(","),
          severityList.join(","),
          timeRange.startTime,
          timeRange.endTime,
        ]
      : null,
    async () => {
      return AssetService.getAssetAlarms(
        assetId,
        page,
        pageSize,
        statusList,
        severityList,
        timeRange.startTime,
        timeRange.endTime,
      );
    },
  );

  const handlePageChange = useCallback(
    (newPage: number) => setPage(newPage),
    [],
  );

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleStatusChange = useCallback((status: string) => {
    setStatusList((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
    setPage(0);
  }, []);

  const handleSeverityChange = useCallback((severity: string) => {
    setSeverityList((prev) =>
      prev.includes(severity)
        ? prev.filter((s) => s !== severity)
        : [...prev, severity],
    );
    setPage(0);
  }, []);

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
    setPage(0);
  }, []);

  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "createdTime",
        header: "Created time",
        render: (alarm) => new Date(alarm.createdTime).toLocaleString(),
      },
      {
        key: "originatorName",
        header: "Originator",
        render: (alarm) => alarm.originatorName || "-",
      },
      {
        key: "type",
        header: "Type",
      },
      {
        key: "severity",
        header: "Severity",
        render: (alarm) => (
          <Badge
            variant={
              alarm.severity === "CRITICAL" ? "destructive" : "secondary"
            }
          >
            {alarm.severity}
          </Badge>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (alarm) => {
          const isCleared = alarm.status.includes("CLEARED");
          return (
            <Badge
              variant="outline"
              className={
                isCleared ? "text-slate-500" : "text-amber-600 border-amber-200"
              }
            >
              {alarm.status}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <AlarmFilters
          selectedStatuses={statusList as AlarmStatus[]}
          selectedSeverities={severityList as AlarmSeverity[]}
          onStatusChange={handleStatusChange as any}
          onSeverityChange={handleSeverityChange as any}
        />
        <TimeRangeFilter value={timeRange} onChange={handleTimeRangeChange} />
      </div>

      <DataTable
        title="Alarms"
        data={data?.data || []}
        columns={columns}
        getRowId={(row) => row.id.id}
        isLoading={isLoading}
        currentPage={page}
        pageSize={pageSize}
        totalPages={data?.totalPages || 0}
        totalElements={data?.totalElements || 0}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        emptyMessage="No alarms found for this asset."
        loadingMessage="Loading alarms..."
      />
    </div>
  );
}
