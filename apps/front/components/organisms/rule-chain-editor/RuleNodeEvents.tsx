"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { RuleChainService } from "@/lib/services/thingsboardServices/ruleChainService";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/molecules/DataTable";
import {
  TimeWindowPicker,
  type TimeWindowValue,
} from "@/components/molecules/TimeWindowPicker";
import Select from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface RuleNodeEventsProps {
  nodeId: string;
  tenantId?: string;
}

const TruncatedCell = ({
  value,
  maxWidth = "120px",
}: {
  value: string;
  maxWidth?: string;
}) => {
  if (!value) return <span>-</span>;
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="truncate cursor-default" style={{ maxWidth }}>
            {value}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[400px] break-all">
          {value}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function RuleNodeEvents({ nodeId, tenantId }: RuleNodeEventsProps) {
  const actualNodeId = useMemo(() => nodeId.replace(/^rule_/, ""), [nodeId]);

  const [eventType, setEventType] = useState("DEBUG_RULE_NODE");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const [timeWindow, setTimeWindow] = useState<TimeWindowValue>({
    mode: "last",
    lastMs: 24 * 60 * 60 * 1000,
    lastLabel: "1 day",
  });
  const [refreshNonce, setRefreshNonce] = useState(0);

  // Calculate startTime and endTime based on timeWindow
  const { startTime, endTime } = useMemo(() => {
    let st: number | undefined;
    let et: number | undefined;

    const now = Date.now();
    if (timeWindow.mode === "last") {
      st = now - (timeWindow.lastMs ?? 86400000);
      et = now;
    } else if (
      timeWindow.mode === "range" &&
      timeWindow.startTime &&
      timeWindow.endTime
    ) {
      st = timeWindow.startTime.getTime();
      et = timeWindow.endTime.getTime();
    } else if (timeWindow.mode === "relative") {
      st = timeWindow.startTime?.getTime() ?? now - 86400000;
      et = timeWindow.endTime?.getTime() ?? now;
    }
    return { startTime: st, endTime: et };
  }, [timeWindow, refreshNonce]);

  const { data, isLoading, mutate } = useSWR(
    actualNodeId
      ? [
          "events",
          "RULE_NODE",
          actualNodeId,
          tenantId,
          eventType,
          page,
          pageSize,
          sortProperty,
          sortOrder,
          startTime,
          endTime,
          refreshNonce,
        ]
      : null,
    async ([_, eType, id, tId, evtType, p, ps, sProp, sOrd, start, end]) => {
      return RuleChainService.fetchEvents(
        eType as string,
        id as string,
        tId as string,
        evtType as string,
        p as number,
        ps as number,
        sProp as string,
        sOrd as "ASC" | "DESC",
        start as number,
        end as number,
      );
    },
    { keepPreviousData: true },
  );

  const events = data?.data ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetails = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const columns = useMemo<DataTableColumn<any>[]>(() => {
    const commonColumns: DataTableColumn<any>[] = [
      {
        key: "createdTime",
        header: "Event time",
        sortable: true,
        render: (item: any) =>
          new Date(item.createdTime).toLocaleString("pl-PL"),
      },
      {
        key: "server",
        header: "Server",
        render: (item: any) => item.body?.server ?? "",
      },
    ];

    if (eventType === "DEBUG_RULE_NODE") {
      return [
        ...commonColumns,
        {
          key: "type",
          header: "Type",
          render: (item: any) =>
            item.body?.type ?? item.body?.msgDirection ?? "",
        },
        {
          key: "entityType",
          header: "Entity type",
          render: (item: any) => item.body?.entityType ?? "",
        },
        {
          key: "entityId",
          header: "Entity Id",
          render: (item: any) => (
            <TruncatedCell value={item.body?.entityId} maxWidth="140px" />
          ),
        },
        {
          key: "msgId",
          header: "Message Id",
          render: (item: any) => (
            <TruncatedCell value={item.body?.msgId} maxWidth="140px" />
          ),
        },
        {
          key: "msgType",
          header: "Message Type",
          render: (item: any) => (
            <TruncatedCell value={item.body?.msgType} maxWidth="150px" />
          ),
        },
        {
          key: "relationType",
          header: "Relation Type",
          render: (item: any) => item.body?.relationType ?? "",
        },
        {
          key: "data",
          header: "Data",
          render: (item: any) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDetails(item)}
              title="View data"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          ),
        },
        {
          key: "metadata",
          header: "Metadata",
          render: (item: any) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDetails(item)}
              title="View metadata"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          ),
        },
        {
          key: "error",
          header: "Error",
          render: (item: any) => (
            <TruncatedCell value={item.body?.error} maxWidth="120px" />
          ),
        },
      ];
    }

    if (eventType === "LC_EVENT") {
      return [
        ...commonColumns,
        {
          key: "event",
          header: "Event",
          render: (item: any) => (
            <TruncatedCell
              value={item.body?.event ?? item.body?.type}
              maxWidth="150px"
            />
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (item: any) =>
            item.body?.status ?? (item.body?.error ? "Failure" : "Success"),
        },
        {
          key: "error",
          header: "Error",
          render: (item: any) => (
            <TruncatedCell value={item.body?.error} maxWidth="200px" />
          ),
        },
      ];
    }

    if (eventType === "STATS") {
      return [
        ...commonColumns,
        {
          key: "messagesProcessed",
          header: "Messages processed",
          render: (item: any) => item.body?.messagesProcessed ?? 0,
        },
        {
          key: "errorsOccurred",
          header: "Errors occurred",
          render: (item: any) => item.body?.errorsOccurred ?? 0,
        },
      ];
    }

    // Default for ERROR or generic
    return [
      ...commonColumns,
      {
        key: "method",
        header: "Method",
        render: (item: any) => (
          <TruncatedCell value={item.body?.method} maxWidth="150px" />
        ),
      },
      {
        key: "error",
        header: "Error",
        render: (item: any) => (
          <TruncatedCell value={item.body?.error} maxWidth="200px" />
        ),
      },
    ];
  }, [eventType]);

  const filterComponent = (
    <div className="flex items-center gap-4">
      <Select
        value={eventType}
        onValueChange={setEventType}
        options={[
          { value: "DEBUG_RULE_NODE", label: "Debug" },
          { value: "ERROR", label: "Error" },
          { value: "LC_EVENT", label: "Lifecycle Event" },
          { value: "STATS", label: "Statistics" },
        ]}
        className="w-[180px] bg-white dark:bg-slate-800"
      />
      <TimeWindowPicker value={timeWindow} onChange={setTimeWindow} />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        title="Events"
        data={events}
        columns={columns}
        getRowId={(item) => item.id?.id}
        isLoading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={setPage}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={(property: string, order: "ASC" | "DESC") => {
          setSortProperty(property);
          setSortOrder(order);
        }}
        onRefresh={() => setRefreshNonce((n) => n + 1)}
        filterComponent={filterComponent}
        emptyMessage="No events found."
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <h3 className="text-sm font-semibold mb-2">Message Data</h3>
              <pre className="bg-slate-100 dark:bg-slate-950 p-4 rounded-md text-xs overflow-x-auto border border-slate-200 dark:border-slate-800 whitespace-pre-wrap word-break">
                {selectedEvent?.body?.data
                  ? (() => {
                      try {
                        return JSON.stringify(
                          JSON.parse(selectedEvent.body.data),
                          null,
                          2,
                        );
                      } catch {
                        return selectedEvent.body.data;
                      }
                    })()
                  : "No data"}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Metadata</h3>
              <pre className="bg-slate-100 dark:bg-slate-950 p-4 rounded-md text-xs overflow-x-auto border border-slate-200 dark:border-slate-800 whitespace-pre-wrap word-break">
                {selectedEvent?.body?.metadata
                  ? (() => {
                      try {
                        return JSON.stringify(
                          JSON.parse(selectedEvent.body.metadata),
                          null,
                          2,
                        );
                      } catch {
                        return selectedEvent.body.metadata;
                      }
                    })()
                  : "No metadata"}
              </pre>
            </div>
            {selectedEvent?.body?.error && (
              <div>
                <h3 className="text-sm font-semibold text-red-500 mb-2">
                  Error
                </h3>
                <pre className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 p-4 rounded-md text-xs overflow-x-auto border whitespace-pre-wrap word-break">
                  {selectedEvent.body.error}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
