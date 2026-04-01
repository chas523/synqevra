"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

type Lwm2mInstanceDialogProps = {
  open: boolean;
  title: string;
  instanceDraftValues: number[];
  instanceDraftInput: string;
  onInputChange: (value: string) => void;
  onAddDraftValue: () => void;
  onRemoveDraftValue: (value: number) => void;
  onCancel: () => void;
  onSave: () => void;
  disableSave: boolean;
};

export function Lwm2mInstanceDialog({
  open,
  title,
  instanceDraftValues,
  instanceDraftInput,
  onInputChange,
  onAddDraftValue,
  onRemoveDraftValue,
  onCancel,
  onSave,
  disableSave,
}: Lwm2mInstanceDialogProps) {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Instances list*</DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-input px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            {instanceDraftValues.map((value) => (
              <span
                key={value}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-sm"
              >
                <span>{value}</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onRemoveDraftValue(value)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}

            <input
              value={instanceDraftInput}
              onChange={(event) => onInputChange(event.target.value)}
              onBlur={onAddDraftValue}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  onAddDraftValue();
                }
              }}
              placeholder="Type instance number"
              className="min-w-32 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave} disabled={disableSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
