"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DataTable, type DataTableColumn } from "@/components/molecules/DataTable";
import { AlarmHistoryDialog } from "@/components/organisms/AlarmHistoryDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAlarmStream } from "@/hooks/thingsboard/alarms/useAlarmStream";
import { useAppSelector } from "@/lib/redux/store";
import {
  AlarmService,
  type AlarmHistoryItemDto,
  type TenantAlarmDto,
  type TenantAlarmPageDto,
} from "@/lib/services/alarmServices/alarmService";
import type { AlarmStreamEvent } from "@/types/alarmStream";
import { RefreshCw, Search, Siren } from "lucide-react";
import { toast } from "sonner";

type AlarmStatusValue = TenantAlarmDto["status"];

interface AlarmViewItem {
  id: string;
  createdTime: number;
  type: string;
  deviceId?: string;
  status?: AlarmStatusValue;
  source: "REST" | "WS";
}

const MAX_ITEMS = 100;
const PAGE_SIZE = 10;

const STATUS_TRANSITIONS: Record<AlarmStatusValue, AlarmStatusValue[]> = {
  OPEN_UNACK: ["OPEN_ACK", "RESOLVED"],
  OPEN_ACK: ["OPEN_UNACK", "RESOLVED"],
  RESOLVED: ["OPEN_UNACK"],
};

const STATUS_LABELS: Record<AlarmStatusValue, string> = {
  OPEN_UNACK: "Open",
  OPEN_ACK: "Acknowledged",
  RESOLVED: "Resolved",
};

function mapTenantAlarm(alarm: TenantAlarmDto): AlarmViewItem {
  return {
    id: alarm.id,
    createdTime: Date.parse(alarm.updatedAt || alarm.createdAt),
    type: alarm.alarmType,
    deviceId: alarm.deviceId,
    status: alarm.status,
    source: "REST",
  };
}

function mapStreamAlarm(event: AlarmStreamEvent): AlarmViewItem {
  return {
    id: event.alarmId,
    createdTime: Date.parse(event.timestamp) || Date.now(),
    type: event.alarmType,
    deviceId: event.deviceId,
    status: event.status,
    source: "WS",
  };
}

function getStatusActionLabel(
  currentStatus: AlarmStatusValue,
  nextStatus: AlarmStatusValue,
): string {
  if (currentStatus === "OPEN_UNACK" && nextStatus === "OPEN_ACK") {
    return "Acknowledge";
  }

  if (
    (currentStatus === "OPEN_UNACK" || currentStatus === "OPEN_ACK") &&
    nextStatus === "RESOLVED"
  ) {
    return "Resolve";
  }

  if (currentStatus === "RESOLVED" && nextStatus === "OPEN_UNACK") {
    return "Reopen";
  }

  if (currentStatus === "OPEN_ACK" && nextStatus === "OPEN_UNACK") {
    return "Mark as Open";
  }

  return `Set to ${STATUS_LABELS[nextStatus]}`;
}

function renderStatusBadge(status?: AlarmStatusValue) {
  if (!status) {
    return <span className="text-muted-foreground">-</span>;
  }

  const isResolved = status === "RESOLVED";
  return (
    <Badge
      variant="outline"
      className={
        isResolved
          ? "border-emerald-300 bg-emerald-500/10 text-emerald-700"
          : "border-amber-300 bg-amber-500/10 text-amber-800"
      }
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export default function AlarmsPage() {
  const user = useAppSelector((state) => state.user.user);
  const tenantId = user?.tenantId ?? null;
  const role = user?.role;

  const [alarms, setAlarms] = useState<AlarmViewItem[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [resolvedPage, setResolvedPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updatingAlarmIds, setUpdatingAlarmIds] = useState<Record<string, boolean>>({});
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<AlarmHistoryItemDto[]>([]);
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmViewItem | null>(null);

  const loadTenantAlarmsAction = useCallback(async () => {
    if (!tenantId || role === "ADMIN") {
      setAlarms([]);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      const response: TenantAlarmPageDto =
        await AlarmService.getCurrentTenantAlarms(0, 50);

      setAlarms(
        (response.data ?? [])
          .map(mapTenantAlarm)
          .sort((a, b) => b.createdTime - a.createdTime),
      );
      setActivePage(0);
      setResolvedPage(0);
    } catch (error) {
      setLoadError("Failed to load alarms");
    } finally {
      setIsLoading(false);
    }
  }, [role, tenantId]);

  useEffect(() => {
    void loadTenantAlarmsAction();
  }, [loadTenantAlarmsAction]);

  const handleAlarmEventAction = useCallback((event: AlarmStreamEvent) => {
    setAlarms((previous) => {
      const incoming = mapStreamAlarm(event);
      const filtered = previous.filter((item) => item.id !== incoming.id);
      return [incoming, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const { isConnected, isSubscribed, isEnabled, lastError } = useAlarmStream({
    tenantId,
    role,
    onAlarmEventAction: handleAlarmEventAction,
  });

  const openHistoryAction = useCallback(async (alarm: AlarmViewItem) => {
    setSelectedAlarm(alarm);
    setHistoryOpen(true);
    setHistoryLoading(true);

    try {
      const response = await AlarmService.getAlarmHistory(alarm.id, 100);
      setHistoryItems(response.items ?? []);
    } catch {
      setHistoryItems([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const updateAlarmStatusAction = useCallback(
    async (alarm: AlarmViewItem, nextStatus: AlarmStatusValue) => {
      if (!alarm.status || alarm.status === nextStatus) {
        return;
      }

      setUpdatingAlarmIds((previous) => ({
        ...previous,
        [alarm.id]: true,
      }));

      try {
        const updatedAlarm = await AlarmService.updateCurrentTenantAlarmStatus(
          alarm.id,
          nextStatus,
        );

        setAlarms((previous) => {
          const nextItem = mapTenantAlarm(updatedAlarm);
          const filtered = previous.filter((item) => item.id !== alarm.id);
          return [nextItem, ...filtered].slice(0, MAX_ITEMS);
        });

        toast.success(`Alarm status changed to ${nextStatus}`);
      } catch (error) {
        toast.error("Failed to update alarm status");
      } finally {
        setUpdatingAlarmIds((previous) => {
          const next = { ...previous };
          delete next[alarm.id];
          return next;
        });
      }
    },
    [],
  );

  const columns = useMemo<DataTableColumn<AlarmViewItem>[]>(
    () => [
      {
        key: "createdTime",
        header: "Created",
        render: (item) => new Date(item.createdTime).toLocaleString(),
      },
      {
        key: "type",
        header: "Type",
        render: (item) => <span className="font-medium">{item.type}</span>,
      },
      {
        key: "deviceId",
        header: "Device",
        render: (item) => item.deviceId || "-",
      },
      {
        key: "status",
        header: "Status",
        render: (item) => {
          const currentStatus = item.status;
          if (!currentStatus) {
            return renderStatusBadge(currentStatus);
          }

          const nextStatuses = STATUS_TRANSITIONS[currentStatus] ?? [];
          const isUpdating = updatingAlarmIds[item.id] === true;

          if (nextStatuses.length === 0 || isUpdating) {
            return renderStatusBadge(currentStatus);
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={(event) => event.stopPropagation()}
                  className="cursor-pointer"
                >
                  {renderStatusBadge(currentStatus)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {nextStatuses.map((status) => (
                  <DropdownMenuItem
                    key={`${item.id}-${status}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      void updateAlarmStatusAction(item, status);
                    }}
                  >
                    {getStatusActionLabel(currentStatus, status)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        key: "source",
        header: "Source",
        render: (item) => <Badge variant="outline">{item.source}</Badge>,
      },
    ],
    [updateAlarmStatusAction, updatingAlarmIds],
  );

  const filteredAlarms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return alarms;
    }

    return alarms.filter((item) => {
      return (
        item.type.toLowerCase().includes(query) ||
        String(item.status ?? "")
          .toLowerCase()
          .includes(query) ||
        String(item.deviceId ?? "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [alarms, searchQuery]);

  const activeFilteredAlarms = useMemo(
    () => filteredAlarms.filter((item) => item.status !== "RESOLVED"),
    [filteredAlarms],
  );

  const resolvedFilteredAlarms = useMemo(
    () => filteredAlarms.filter((item) => item.status === "RESOLVED"),
    [filteredAlarms],
  );

  const activeTotalPages = Math.max(
    1,
    Math.ceil(activeFilteredAlarms.length / PAGE_SIZE),
  );
  const resolvedTotalPages = Math.max(
    1,
    Math.ceil(resolvedFilteredAlarms.length / PAGE_SIZE),
  );

  const pagedActiveAlarms = useMemo(() => {
    const start = activePage * PAGE_SIZE;
    return activeFilteredAlarms.slice(start, start + PAGE_SIZE);
  }, [activeFilteredAlarms, activePage]);

  const pagedResolvedAlarms = useMemo(() => {
    const start = resolvedPage * PAGE_SIZE;
    return resolvedFilteredAlarms.slice(start, start + PAGE_SIZE);
  }, [resolvedFilteredAlarms, resolvedPage]);

  useEffect(() => {
    if (activePage > activeTotalPages - 1) {
      setActivePage(Math.max(0, activeTotalPages - 1));
    }
  }, [activePage, activeTotalPages]);

  useEffect(() => {
    if (resolvedPage > resolvedTotalPages - 1) {
      setResolvedPage(Math.max(0, resolvedTotalPages - 1));
    }
  }, [resolvedPage, resolvedTotalPages]);

  const statusBadge = useMemo(() => {
    if (!isEnabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }

    if (isConnected && isSubscribed) {
      return <Badge className="bg-green-600 text-white">Realtime On</Badge>;
    }

    return <Badge variant="outline">Realtime Off</Badge>;
  }, [isConnected, isEnabled, isSubscribed]);

  if (role === "ADMIN") {
    return (
      <div className="space-y-3 p-6">
        <h1 className="text-2xl font-semibold">Alarms</h1>
        <p className="text-sm text-muted-foreground">
          Alarm stream is not available for admin role.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-(--spacing(16)))] flex flex-col gap-6">
      <div
        className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm p-5 shadow-sm"
        style={{
          backgroundImage:
            "linear-gradient(120deg, color-mix(in oklab, var(--wl-light-shell-from) 70%, white 30%), color-mix(in oklab, var(--wl-light-shell-via) 72%, white 28%), color-mix(in oklab, var(--wl-light-shell-to) 74%, white 26%))",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-2 bg-background/75 border border-border/70">
              <Siren className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Alarms</h1>
              <p className="text-sm text-muted-foreground">
                Tenant alarms with REST baseline and websocket realtime updates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge}
            <Button variant="outline" onClick={() => void loadTenantAlarmsAction()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {lastError ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {lastError}
        </div>
      ) : null}

      {loadError ? (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {loadError}
        </div>
      ) : null}

      <DataTable
        title="Active Alarms"
        data={pagedActiveAlarms}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        currentPage={activePage}
        totalPages={activeTotalPages}
        totalElements={activeFilteredAlarms.length}
        pageSize={PAGE_SIZE}
        onPageChange={setActivePage}
        onRefresh={() => void loadTenantAlarmsAction()}
        onRowClick={(alarm) => {
          void openHistoryAction(alarm);
        }}
        loadingMessage="Loading alarms..."
        emptyMessage="No active alarms found for current filters."
        filterComponent={
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setActivePage(0);
                setResolvedPage(0);
              }}
              className="pl-9"
              placeholder="Search by type, status, device"
            />
          </div>
        }
      />

      <DataTable
        title="Resolved Alarms"
        data={pagedResolvedAlarms}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        currentPage={resolvedPage}
        totalPages={resolvedTotalPages}
        totalElements={resolvedFilteredAlarms.length}
        pageSize={PAGE_SIZE}
        onPageChange={setResolvedPage}
        onRefresh={() => void loadTenantAlarmsAction()}
        onRowClick={(alarm) => {
          void openHistoryAction(alarm);
        }}
        loadingMessage="Loading resolved alarms..."
        emptyMessage="No resolved alarms found for current filters."
      />

      <AlarmHistoryDialog
        open={historyOpen}
        onOpenChangeAction={setHistoryOpen}
        alarmLabel={selectedAlarm?.type || "Unknown"}
        history={historyItems}
        isLoading={historyLoading}
      />
    </div>
  );
}
