"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
  const [fullClient, setFullClient] = useState<OAuth2ClientPayload | null>(
    null,
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (client?.id?.id) {
      const fetchFullDetails = async () => {
        setIsLoadingDetails(true);
        try {
          const details = await OAuth2Service.getOAuth2ClientById(client.id.id);
          setFullClient(details);
        } catch (error) {
          toast.error("Failed to fetch client details");
          console.error(error);
        } finally {
          setIsLoadingDetails(false);
        }
      };
      fetchFullDetails();
    } else {
      setFullClient(null);
    }
  }, [client?.id?.id]);

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
          {isLoadingDetails ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : fullClient ? (
            <OAuth2ClientForm
              key={`form-${fullClient.id?.id || client.id.id}`}
              initialData={fullClient}
              isSaving={isSaving}
              onSave={handleSave}
              onCancel={onClose}
              templates={templates}
            />
          ) : null}
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
