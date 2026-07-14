"use client";

import Select from "@/components/molecules/PortalSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

type Lwm2mAttributeKey = "minimumPeriod" | "maximumPeriod";

type Lwm2mInstanceAttributesDialogProps = {
  open: boolean;
  title: string;
  rows: Array<{
    key: Lwm2mAttributeKey;
    label: string;
    value: number;
  }>;
  attributeOptions: Array<{
    value: Lwm2mAttributeKey;
    label: string;
    disabled?: boolean;
  }>;
  selectedAttribute: Lwm2mAttributeKey;
  attributeValue: string;
  onSelectedAttributeChange: (value: Lwm2mAttributeKey) => void;
  onAttributeValueChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (key: Lwm2mAttributeKey) => void;
  onCancel: () => void;
  onSave: () => void;
  disableAdd: boolean;
};

export function Lwm2mInstanceAttributesDialog({
  open,
  title,
  rows,
  attributeOptions,
  selectedAttribute,
  attributeValue,
  onSelectedAttributeChange,
  onAttributeValueChange,
  onAdd,
  onRemove,
  onCancel,
  onSave,
  disableAdd,
}: Lwm2mInstanceAttributesDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onCancel();
        }
      }}
      modal={true}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Select
              options={attributeOptions}
              value={selectedAttribute}
              onValueChange={(value) =>
                onSelectedAttributeChange(value as Lwm2mAttributeKey)
              }
              placeholder="Name attribute"
            />
            <Input
              value={attributeValue}
              onChange={(event) => onAttributeValueChange(event.target.value)}
              placeholder="Value"
              inputMode="decimal"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onAdd();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={onAdd}
              disabled={disableAdd}
            >
              Add
            </Button>
          </div>

          {rows.length > 0 && (
            <div className="space-y-2">
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="text-sm">
                    <span className="font-medium">{row.label}:</span>{" "}
                    <span>{row.value}</span>
                  </div>
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => onRemove(row.key)}
                    aria-label={`Remove ${row.label}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
