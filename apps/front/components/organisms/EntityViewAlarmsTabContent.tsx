"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
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
import { EntityViewService } from "@/lib/services/thingsboardServices/entityViewService";

interface EntityViewAlarmsTabContentProps {
  entityViewId: string;
}

export function EntityViewAlarmsTabContent({
  entityViewId,
}: EntityViewAlarmsTabContentProps) {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusList, setStatusList] = useState<string[]>([]);
  const [severityList, setSeverityList] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>({ type: "ALL_TIME" });

  const { data, isLoading, mutate } = useSWR(
    entityViewId
      ? [
          "entityViewAlarms",
          entityViewId,
          page,
          pageSize,
          statusList.join(","),
          severityList.join(","),
          timeRange.startTime,
          timeRange.endTime,
        ]
      : null,
    async () => {
      return EntityViewService.getEntityViewAlarms(
        entityViewId,
        page,
        pageSize,
        statusList,
        severityList,
        timeRange.startTime,
        timeRange.endTime,
      );
    },
  );

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

  const filteredAlarms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return data?.data || [];
    }

    return (data?.data || []).filter((alarm) => {
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
        <TimeRangeFilter
          value={timeRange}
          onChange={(range) => {
            setTimeRange(range);
            setPage(0);
          }}
        />
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
        onPageChange={isSearching ? () => {} : setPage}
        onRefresh={() => mutate()}
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
            : "No alarms found for this entity view."
        }
        loadingMessage="Loading alarms..."
      />
    </div>
  );
}
