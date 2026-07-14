"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  OAuth2ClientForm,
  OAuth2ClientPayload,
} from "@/components/organisms/OAuth2ClientForm";
import { OAuth2Service } from "@/lib/services/thingsboardServices/oauth2Service";
import { useOAuth2ConfigTemplates } from "@/hooks/thingsboard/oauth2/useOAuth2ConfigTemplates";

interface AddOAuth2ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddOAuth2ClientModal({
  open,
  onOpenChange,
  onSuccess,
}: AddOAuth2ClientModalProps) {
  const { templates } = useOAuth2ConfigTemplates();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (payload: OAuth2ClientPayload) => {
    setIsSaving(true);
    try {
      await OAuth2Service.saveOAuth2Client(payload);
      toast.success("OAuth 2.0 client added successfully.");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to add OAuth 2.0 client",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden bg-background dark:bg-slate-900 border-border dark:border-slate-800">
        <DialogHeader className="px-6 py-4 border-b border-border dark:border-slate-800 bg-primary dark:bg-slate-800">
          <DialogTitle className="text-white">Add OAuth 2.0 client</DialogTitle>
        </DialogHeader>
        <div className="h-112.5 overflow-hidden flex flex-col">
          {/* Key is used to reset form state when modal opens */}
          {open && (
            <OAuth2ClientForm
              key="add-form"
              isSaving={isSaving}
              onSave={handleSave}
              onCancel={() => onOpenChange(false)}
              templates={templates}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
