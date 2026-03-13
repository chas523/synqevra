"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EntityDetailPanel } from "@/components/templates/EntityDetailPanel";
import {
  OAuth2ClientForm,
  OAuth2ClientPayload,
} from "@/components/organisms/OAuth2ClientForm";
import {
  OAuth2Service,
  OAuth2ClientInfo,
} from "@/lib/services/thingsboardServices/oauth2Service";
import { useOAuth2ConfigTemplates } from "@/hooks/thingsboard/oauth2/useOAuth2ConfigTemplates";

interface OAuth2ClientDetailPanelProps {
  client: OAuth2ClientInfo | null;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export function OAuth2ClientDetailPanel({
  client,
  onClose,
  onSaveSuccess,
}: OAuth2ClientDetailPanelProps) {
  const { templates } = useOAuth2ConfigTemplates();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (payload: OAuth2ClientPayload) => {
    setIsSaving(true);
    try {
      await OAuth2Service.saveOAuth2Client(payload);
      toast.success("OAuth 2.0 client updated successfully.");
      onSaveSuccess();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update OAuth 2.0 client",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    {
      id: "details",
      label: "Details",
      content: client ? (
        <div className="h-full">
          {/* We pass a unique key per client id to remount form properly */}
          <OAuth2ClientForm
            key={`form-${client.id.id}`}
            initialData={client as any}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={onClose}
            templates={templates}
          />
        </div>
      ) : null,
    },
  ];

  return (
    <EntityDetailPanel
      isOpen={!!client}
      onClose={onClose}
      title={client?.title || "OAuth 2.0 client details"}
      subtitle="OAuth 2.0 client details" // TB style repetition or breadcrumb equivalent
      tabs={tabs}
      defaultTab="details"
    />
  );
}
