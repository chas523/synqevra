"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GatewayService } from "@/lib/services/thingsboardServices/gatewayService";
import type {
  GatewayConnectorsData,
  AddGatewayConnectorPayload,
} from "@/lib/services/thingsboardServices/gatewayService";
import type { GatewayListItem } from "@/types/thingsboardGatewayTypes";

interface GatewayConnectorsDialogProps {
  gateway: GatewayListItem | null;
  onClose: () => void;
  onUpdated?: () => void;
}

const CONNECTOR_TYPES = ["mqtt"];

export function GatewayConnectorsDialog({
  gateway,
  onClose,
  onUpdated,
}: GatewayConnectorsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<GatewayConnectorsData | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("mqtt");

  const isOpen = gateway !== null;

  const loadConnectors = useCallback(async () => {
    const id = gateway?.id?.id;
    if (!id) return;

    setIsLoading(true);
    try {
      const response = await GatewayService.fetchGatewayConnectors(id);
      setData(response);
    } catch {
      toast.error("Failed to load gateway connectors");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [gateway]);

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setType("mqtt");
    void loadConnectors();
  }, [isOpen, loadConnectors]);

  const handleAddConnector = useCallback(async () => {
    const id = gateway?.id?.id;
    const connectorName = name.trim();

    if (!id) return;
    if (!connectorName) {
      toast.error("Connector name is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload: AddGatewayConnectorPayload = {
        name: connectorName,
        type,
      };
      await GatewayService.addGatewayConnector(id, payload);
      toast.success(`Connector \"${connectorName}\" added`);
      setName("");
      await loadConnectors();
      onUpdated?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Failed to add connector");
    } finally {
      setIsSaving(false);
    }
  }, [gateway, name, type, loadConnectors, onUpdated]);

  const connectorRows = useMemo(() => data?.connectors ?? [], [data]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose();
      }}
    >
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Connectors
            {gateway ? ` - ${gateway.name}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading connectors...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Version</p>
                  <p className="text-sm font-semibold">
                    {data?.version ?? "-"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-sm font-semibold">
                    {data?.activeConnectors.length ?? 0}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Inactive</p>
                  <p className="text-sm font-semibold">
                    {data?.inactiveConnectors.length ?? 0}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Total listed</p>
                  <p className="text-sm font-semibold">
                    {connectorRows.length}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Add connector</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void loadConnectors()}
                    disabled={isLoading || isSaving}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload
                  </Button>
                </div>
                <div className="grid grid-cols-[1fr_180px_auto] gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="connector-name">Name</Label>
                    <Input
                      id="connector-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g. mqtt-a"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="connector-type">Type</Label>
                    <select
                      id="connector-type"
                      value={type}
                      onChange={(event) => setType(event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      disabled={isSaving}
                    >
                      {CONNECTOR_TYPES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={() => void handleAddConnector()}
                      disabled={isSaving || !name.trim()}
                      className="w-full"
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Add connector
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  Active connectors list
                </h3>
                {connectorRows.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No active connectors found.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {connectorRows.map((connector) => (
                      <div
                        key={connector.name}
                        className="rounded-lg border px-4 py-3 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {connector.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Type: {String(connector.config?.type ?? "-")}
                          </p>
                        </div>
                        <Badge
                          variant={
                            connector.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {connector.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
