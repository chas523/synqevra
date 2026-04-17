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
  SelectAdmin,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";
import { RuleChainService } from "@/lib/services/thingsboardServices/ruleChainService";

interface RuleChainEventsTabContentProps {
  ruleChainId: string;
  tenantId?: string;
}

const EVENT_TYPE_OPTIONS = [
  { value: "DEBUG_RULE_CHAIN", label: "Debug" },
  { value: "LC_EVENT", label: "Lifecycle event" },
  { value: "STATS", label: "Statistics" },
  { value: "ERROR", label: "Error" },
];

export function RuleChainEventsTabContent({
  ruleChainId,
  tenantId,
}: RuleChainEventsTabContentProps) {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventType, setEventType] = useState("LC_EVENT");
  const [timeRange, setTimeRange] = useState<TimeRange>({ type: "ALL_TIME" });
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState("{}");

  const { data, isLoading, mutate } = useSWR(
    ruleChainId
      ? [
          "ruleChainEvents",
          ruleChainId,
          eventType,
          page,
          pageSize,
          timeRange.startTime,
          timeRange.endTime,
          tenantId,
        ]
      : null,
    () =>
      RuleChainService.fetchEvents(
        "RULE_CHAIN",
        ruleChainId,
        tenantId || "",
        eventType,
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
  const handleRefresh = useCallback(() => mutate(), [mutate]);

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
    setPage(0);
  }, []);

  const handleOpenDetails = useCallback((row: any) => {
    setSelectedDetails(JSON.stringify(row.body || {}, null, 2));
    setDetailsDialogOpen(true);
  }, []);

  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "createdTime",
        header: "Event time",
        render: (row) => new Date(row.createdTime).toLocaleString(),
      },
      {
        key: "server",
        header: "Server",
        render: (row) => row.body?.server || "-",
      },
      {
        key: "event",
        header: "Event Type",
        render: (row) => row.body?.event || row.type || "-",
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
           <span className={row.body?.success ? "text-green-600" : row.body?.error ? "text-red-600" : ""}>
             {row.body?.success ? "Success" : row.body?.error ? "Error" : "-"}
           </span>
        ),
      },
      {
        key: "details",
        header: "Details",
        render: (row) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenDetails(row)}
          >
            Show details
          </Button>
        ),
      },
    ],
    [handleOpenDetails],
  );

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data?.data || [];

    return (data?.data || []).filter((row: any) => {
      const server = String(row.body?.server || "").toLowerCase();
      const event = String(row.body?.event || row.type || "").toLowerCase();
      return server.includes(query) || event.includes(query);
    });
  }, [data?.data, searchQuery]);

  return (
    <div className="space-y-4">
      <DataTable
        title="Events"
        data={filteredEvents}
        columns={columns}
        getRowId={(row) => row.id.id}
        isLoading={isLoading}
        currentPage={page}
        pageSize={pageSize}
        totalPages={data?.totalPages || 0}
        totalElements={data?.totalElements || 0}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        filterComponent={
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="w-full sm:w-48">
              <SelectAdmin
                value={eventType}
                onValueChange={(val) => {
                  setEventType(val);
                  setPage(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectAdmin>
            </div>
            <div className="w-full sm:w-64">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search event..."
              />
            </div>
          </div>
        }
        customAction={
          <TimeRangeFilter value={timeRange} onChange={handleTimeRangeChange} />
        }
        emptyMessage="No events found."
        loadingMessage="Loading events..."
      />

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-170">
          <DialogHeader>
            <DialogTitle>Event details</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
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
