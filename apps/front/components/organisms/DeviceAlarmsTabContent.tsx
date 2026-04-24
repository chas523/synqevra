"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
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
import { Input } from "@/components/ui/input";

interface DeviceAlarmsTabContentProps {
  deviceId: string;
}

interface DeviceAlarm {
  id: { id: string };
  createdTime: number;
  originatorName?: string;
  type?: string;
  severity?: string;
  status?: string;
}

interface DeviceAlarmsResponse {
  data: DeviceAlarm[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export function DeviceAlarmsTabContent({
  deviceId,
}: DeviceAlarmsTabContentProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusList, setStatusList] = useState<string[]>([]);
  const [severityList, setSeverityList] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>({ type: "ALL_TIME" });

  const { data, isLoading, mutate } = useSWR<DeviceAlarmsResponse>(
    deviceId
      ? [
          "deviceAlarms",
          deviceId,
          page,
          pageSize,
          statusList.join(","),
          severityList.join(","),
          timeRange.startTime,
          timeRange.endTime,
        ]
      : null,
    async () => {
      return DeviceService.getDeviceAlarms(
        deviceId,
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

  const columns: DataTableColumn<DeviceAlarm>[] = useMemo(
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
          const isCleared = String(alarm.status ?? "").includes("CLEARED");
          return (
            <Badge
              variant="outline"
              className={
                isCleared
                  ? "border-border text-muted-foreground"
                  : "border-amber-200 text-amber-600"
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

  const filteredAlarms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return data?.data || [];
    }

    return (data?.data || []).filter((alarm: DeviceAlarm) => {
      const originatorName = String(alarm.originatorName || "").toLowerCase();
      const type = String(alarm.type || "").toLowerCase();
      const severity = String(alarm.severity || "").toLowerCase();
      const status = String(alarm.status || "").toLowerCase();

      return (
        originatorName.includes(query) ||
        type.includes(query) ||
        severity.includes(query) ||
        status.includes(query)
      );
    });
  }, [data?.data, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

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
        data={filteredAlarms}
        columns={columns}
        getRowId={(row) => row.id.id}
        isLoading={isLoading}
        currentPage={isSearching ? 0 : page}
        pageSize={isSearching ? filteredAlarms.length || 10 : pageSize}
        totalPages={isSearching ? 1 : data?.totalPages || 0}
        totalElements={
          isSearching ? filteredAlarms.length : data?.totalElements || 0
        }
        onPageChange={isSearching ? () => {} : handlePageChange}
        onRefresh={handleRefresh}
        filterComponent={
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="w-full sm:w-64">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search alarm..."
              />
            </div>
          </div>
        }
        emptyMessage={
          isSearching
            ? "No alarms match your search."
            : "No alarms found for this device."
        }
        loadingMessage="Loading alarms..."
      />
    </div>
  );
}
