"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatTelemetryKeyLabel } from "@/lib/constants/telemetryLabels";

import type { AlarmHistoryItemDto } from "@/lib/services/alarmServices/alarmService";

interface AlarmHistoryDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  alarmLabel: string;
  history: AlarmHistoryItemDto[];
  isLoading: boolean;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

function renderTelemetryRows(payload: Record<string, unknown>) {
  const entries = Object.entries(payload ?? {});

  if (entries.length === 0) {
    return <p className="mt-1 text-xs text-muted-foreground">No telemetry values.</p>;
  }

  return (
    <div className="mt-1 space-y-1">
      {entries.map(([key, value]) => (
        <div key={key} className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{formatTelemetryKeyLabel(key)}:</span>{" "}
          <span>{formatValue(value)}</span>
        </div>
      ))}
    </div>
  );
}

function renderThresholdRows(snapshot: Record<string, unknown>) {
  const entries = Object.entries(snapshot ?? {});

  if (entries.length === 0) {
    return <p className="mt-1 text-xs text-muted-foreground">No threshold values.</p>;
  }

  return (
    <div className="mt-1 space-y-2">
      {entries.map(([key, value]) => {
        if (!value || typeof value !== "object") {
          return (
            <div key={key} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{formatTelemetryKeyLabel(key)}:</span>{" "}
              <span>{formatValue(value)}</span>
            </div>
          );
        }

        const thresholdRecord = value as Record<string, unknown>;
        const minimum = thresholdRecord.minimum;
        const maximum = thresholdRecord.maximum;

        if (minimum === undefined && maximum === undefined) {
          return null;
        }

        return (
          <div key={key} className="text-xs text-muted-foreground">
            <div className="font-medium text-foreground">{formatTelemetryKeyLabel(key)}</div>
            {minimum !== undefined ? <div>Min: {formatValue(minimum)}</div> : null}
            {maximum !== undefined ? <div>Max: {formatValue(maximum)}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

export function AlarmHistoryDialog({
  open,
  onOpenChangeAction,
  alarmLabel,
  history,
  isLoading,
}: AlarmHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Alarm History: {alarmLabel}</DialogTitle>
          <DialogDescription>
            Timeline of alarm events with telemetry values and threshold snapshots.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No history entries found.</p>
        ) : (
          <div className="max-h-[60vh] overflow-auto space-y-2 pr-1">
            {history.map((item) => (
              <div
                key={item.outboxId}
                className="rounded-md border border-border/70 bg-card/60 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium">{item.alarmType}</div>
                  {item.status ? <Badge variant="outline">{item.status}</Badge> : null}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Event: {item.eventId}
                </div>
                <div className="text-xs text-muted-foreground">
                  Alarm ts: {new Date(item.timestamp).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Outbox ts: {new Date(item.createdAt).toLocaleString()}
                </div>

                <div className="mt-2 rounded-md border border-border/70 bg-background/70 p-2">
                  <div className="text-xs font-medium">Telemetry payload</div>
                  {renderTelemetryRows(item.telemetry)}
                </div>

                <div className="mt-2 rounded-md border border-border/70 bg-background/70 p-2">
                  <div className="text-xs font-medium">Threshold snapshot</div>
                  {renderThresholdRows(item.thresholdSnapshot)}
                </div>

                {Object.keys(item.metadata || {}).length > 0 ? (
                  <details className="mt-2 rounded-md border border-border/70 bg-background/70 p-2">
                    <summary className="cursor-pointer text-xs font-medium">Metadata</summary>
                    <pre className="mt-2 text-[11px] text-muted-foreground whitespace-pre-wrap wrap-break-word">
                      {JSON.stringify(item.metadata, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
