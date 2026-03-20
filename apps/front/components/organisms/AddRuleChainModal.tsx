"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateRuleChainRequest } from "@/lib/services/thingsboardServices/ruleChainService";

interface AddRuleChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (payload: CreateRuleChainRequest) => Promise<void>;
  isSaving: boolean;
}

export function AddRuleChainModal({
  isOpen,
  onClose,
  onAdd,
  isSaving,
}: AddRuleChainModalProps) {
  const [name, setName] = useState("");
  const [debugMode, setDebugMode] = useState(false);
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setName("");
    setDebugMode(false);
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const payload: CreateRuleChainRequest = {
      name,
      type: "CORE",
      debugMode: debugMode ? true : null,
      additionalInfo: {
        description,
      },
    };

    try {
      await onAdd(payload);
      onClose();
      resetForm();
    } catch {
      // error handled by parent
    }
  };

  const isFormValid = name.trim().length > 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Add rule chain
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="dark:text-white" htmlFor="name">
                Name*
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name*"
                required
                className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
              />
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="debugMode"
                checked={debugMode}
                onCheckedChange={(checked) => setDebugMode(checked as boolean)}
                className="dark:border-slate-500"
              />
              <Label
                htmlFor="debugMode"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-white"
              >
                Debug mode
              </Label>
            </div>

            <div className="space-y-2 mt-2">
              <Label className="dark:text-white" htmlFor="description">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="dark:bg-slate-800 dark:text-white dark:border-slate-700 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                resetForm();
              }}
              disabled={isSaving}
              className="dark:text-white"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !isFormValid}>
              {isSaving ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
