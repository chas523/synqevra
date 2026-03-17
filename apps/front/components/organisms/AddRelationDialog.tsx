"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SelectAdmin,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";
import { EntityViewService } from "@/lib/services/thingsboardServices/entityViewService";
import { cn } from "@/lib/utils";

type EntityType =
  | "DEVICE"
  | "ASSET"
  | "ENTITY_VIEW"
  | "TENANT"
  | "CUSTOMER"
  | "USER"
  | "DASHBOARD";

const ENTITY_TYPE_OPTIONS: { value: EntityType; label: string }[] = [
  { value: "DEVICE", label: "Device" },
  { value: "ASSET", label: "Asset" },
  { value: "ENTITY_VIEW", label: "Entity View" },
  { value: "TENANT", label: "Tenant" },
  { value: "CUSTOMER", label: "Customer" },
  { value: "USER", label: "User" },
  { value: "DASHBOARD", label: "Dashboard" },
];

const PRESET_RELATION_TYPES = ["Contains", "Manages"];
const FETCHABLE_ENTITY_TYPES: EntityType[] = [
  "DEVICE",
  "ASSET",
  "ENTITY_VIEW",
  "CUSTOMER",
];

interface EntityOption {
  id: string;
  label: string;
}

interface AddRelationDialogProps {
  open: boolean;
  direction: "FROM" | "TO";
  onClose: () => void;
  onSave: (params: {
    relatedEntityId: string;
    relatedEntityType: string;
    relationType: string;
    direction: "FROM" | "TO";
  }) => Promise<void>;
}

export function AddRelationDialog({
  open,
  direction,
  onClose,
  onSave,
}: AddRelationDialogProps) {
  const [relationType, setRelationType] = useState("Contains");
  const [isCustomRelationType, setIsCustomRelationType] = useState(false);
  const [customRelationType, setCustomRelationType] = useState("");
  const [relatedEntityType, setRelatedEntityType] =
    useState<EntityType>("DEVICE");
  const [entityOptions, setEntityOptions] = useState<EntityOption[]>([]);
  const [entitySearch, setEntitySearch] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [isEntityListOpen, setIsEntityListOpen] = useState(false);
  const [manualEntityId, setManualEntityId] = useState("");
  const [isFetchingEntities, setIsFetchingEntities] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isFetchable = FETCHABLE_ENTITY_TYPES.includes(relatedEntityType);

  useEffect(() => {
    if (!open) return;

    setEntityOptions([]);
    setSelectedEntityId("");
    setIsEntityListOpen(false);
    setEntitySearch("");

    if (!isFetchable) return;

    setIsFetchingEntities(true);

    const fetchEntities = async () => {
      try {
        let options: EntityOption[] = [];
        switch (relatedEntityType) {
          case "DEVICE": {
            const res = await DeviceService.fetchDevices(0, 200, "name", "ASC");
            options = res.data.map((d) => ({
              id: d.id.id ?? "",
              label: d.name,
            }));
            break;
          }
          case "ASSET": {
            const res = await AssetService.fetchAssets(0, 200, "name", "ASC");
            options = res.data.map((a) => ({
              id: a.id.id ?? "",
              label: a.name,
            }));
            break;
          }
          case "ENTITY_VIEW": {
            const res = await EntityViewService.fetchEntityViews(
              0,
              200,
              "name",
              "ASC",
            );
            options = res.data.map((e) => ({
              id: e.id.id ?? "",
              label: e.name,
            }));
            break;
          }
          case "CUSTOMER": {
            const res = await AssetService.getCustomers(0, 200, "title", "ASC");
            options = res.data.map((c) => ({
              id: c.id.id ?? "",
              label: c.title,
            }));
            break;
          }
        }
        setEntityOptions(options);
      } catch {
        toast.error("Failed to load entities");
      } finally {
        setIsFetchingEntities(false);
      }
    };

    fetchEntities();
  }, [relatedEntityType, open]);

  const filteredOptions = entityOptions.filter((o) =>
    o.label.toLowerCase().includes(entitySearch.toLowerCase()),
  );

  const effectiveRelationType = isCustomRelationType
    ? customRelationType
    : relationType;

  const resetState = () => {
    setRelationType("Contains");
    setIsCustomRelationType(false);
    setCustomRelationType("");
    setRelatedEntityType("DEVICE");
    setEntitySearch("");
    setIsEntityListOpen(false);
    setSelectedEntityId("");
    setManualEntityId("");
  };

  const handleClose = () => {
    if (isSaving) return;
    resetState();
    onClose();
  };

  const handleSave = async () => {
    const type = effectiveRelationType.trim();
    const entityId = isFetchable ? selectedEntityId : manualEntityId.trim();

    if (!type) {
      toast.error("Relation type is required");
      return;
    }
    if (!entityId) {
      toast.error("Entity is required");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        relatedEntityId: entityId,
        relatedEntityType,
        relationType: type,
        direction,
      });
      toast.success("Relation added successfully");
      resetState();
      onClose();
    } catch {
      toast.error("Failed to add relation");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add relation ({direction === "FROM" ? "outgoing" : "incoming"})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Relation type */}
          <div className="space-y-1.5">
            <Label>Relation type*</Label>
            {!isCustomRelationType ? (
              <div className="flex gap-2">
                <SelectAdmin
                  value={relationType}
                  onValueChange={setRelationType}
                  disabled={isSaving}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_RELATION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectAdmin>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomRelationType(true)}
                  disabled={isSaving}
                >
                  Custom
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={customRelationType}
                  onChange={(e) => setCustomRelationType(e.target.value)}
                  placeholder="Enter custom relation type"
                  disabled={isSaving}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCustomRelationType(false);
                    setCustomRelationType("");
                  }}
                  disabled={isSaving}
                >
                  Preset
                </Button>
              </div>
            )}
          </div>

          {/* Entity type */}
          <div className="space-y-1.5">
            <Label>Entity type*</Label>
            <SelectAdmin
              value={relatedEntityType}
              onValueChange={(v) => setRelatedEntityType(v as EntityType)}
              disabled={isSaving}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectAdmin>
          </div>

          {/* Entity selection */}
          <div className="space-y-1.5">
            <Label>Entity*</Label>
            {isFetchable ? (
              <div className="border rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsEntityListOpen(!isEntityListOpen)}
                  disabled={isSaving}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm flex items-center justify-between",
                    "hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    isEntityListOpen && "bg-accent",
                  )}
                >
                  <span
                    className={
                      selectedEntityId
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {selectedEntityId
                      ? entityOptions.find((o) => o.id === selectedEntityId)
                          ?.label || selectedEntityId
                      : "Select entity..."}
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform",
                      isEntityListOpen && "rotate-180",
                    )}
                  />
                </button>

                {isEntityListOpen && (
                  <>
                    <Input
                      value={entitySearch}
                      onChange={(e) => setEntitySearch(e.target.value)}
                      placeholder="Search..."
                      className="border-0 border-t rounded-none focus-visible:ring-0"
                      disabled={isSaving}
                      autoFocus
                    />
                    <ScrollArea className="h-40">
                      {isFetchingEntities ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Loading...
                        </div>
                      ) : filteredOptions.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No entities found
                        </div>
                      ) : (
                        filteredOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setSelectedEntityId(opt.id);
                              setIsEntityListOpen(false);
                              setEntitySearch("");
                            }}
                            className={cn(
                              "w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                              selectedEntityId === opt.id &&
                                "bg-accent text-accent-foreground font-medium",
                            )}
                            disabled={isSaving}
                          >
                            {opt.label}
                          </button>
                        ))
                      )}
                    </ScrollArea>
                  </>
                )}
              </div>
            ) : (
              <Input
                value={manualEntityId}
                onChange={(e) => setManualEntityId(e.target.value)}
                placeholder="Enter entity UUID"
                disabled={isSaving}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
