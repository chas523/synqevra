"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import {
  TimeRangeFilter,
  TimeRange,
} from "@/components/molecules/TimeRangeFilter";
import { Label } from "@/components/ui/label";
import {
  SelectAdmin,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";

interface DeviceEventsTabContentProps {
  deviceId: string;
}

const DEVICE_EVENT_TYPE_OPTIONS = [
  { value: "ERROR", label: "Error" },
  { value: "LC_EVENT", label: "Lifecycle event" },
  { value: "STATS", label: "Statistic" },
] as const;

export function DeviceEventsTabContent({
  deviceId,
}: DeviceEventsTabContentProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [eventType, setEventType] = useState<string>("");
  const [timeRange, setTimeRange] = useState<TimeRange>({ type: "ALL_TIME" });

  const { data, isLoading, mutate } = useSWR(
    deviceId
      ? [
          "deviceEvents",
          deviceId,
          page,
          pageSize,
          eventType,
          timeRange.startTime,
          timeRange.endTime,
        ]
      : null,
    async () => {
      return DeviceService.getDeviceEvents(
        deviceId,
        page,
        pageSize,
        eventType || undefined,
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

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
    setPage(0);
  }, []);

  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "createdTime",
        header: "Created time",
        render: (event) => new Date(event.createdTime).toLocaleString(),
      },
      {
        key: "type",
        header: "Type",
        render: (event) => event.body?.type || event.type || "-",
      },
      {
        key: "server",
        header: "Server",
        render: (event) => event.body?.server || "-",
      },
      {
        key: "entityId",
        header: "Entity ID",
        render: (event) => event.entityId?.id || "-",
      },
      {
        key: "data",
        header: "Event Data",
        render: (event) => (
          <div className="max-w-75 truncate text-xs font-mono text-slate-500">
            {JSON.stringify(event.body)}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Label
            htmlFor="eventType"
            className="whitespace-nowrap font-medium text-slate-700"
          >
            Event Type
          </Label>
          <div className="relative">
            <SelectAdmin
              value={eventType || "ALL"}
              onValueChange={(value) => {
                setEventType(value === "ALL" ? "" : value);
                setPage(0);
              }}
            >
              <SelectTrigger id="eventType" className="h-9 w-50">
                <SelectValue placeholder="All event types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All event types</SelectItem>
                {DEVICE_EVENT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectAdmin>
          </div>
        </div>
        <TimeRangeFilter value={timeRange} onChange={handleTimeRangeChange} />
      </div>

      <DataTable
        title="Events"
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
        emptyMessage="No events found for this device."
        loadingMessage="Loading events..."
      />
    </div>
  );
}
