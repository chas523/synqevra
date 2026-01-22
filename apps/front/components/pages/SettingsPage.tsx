import {
  useSecuritySettings,
  useUpdateSecuritySettings,
} from "@/hooks/thingsboard/settings/useSecuritySettings";
import { extractErrorMessage } from "@/lib/utils";
import React from "react";
import { ErrorMessage } from "../molecules";
import LoadingOverlayInformation from "../molecules/LoadingOverlayInformation";
import SecuritySettingsForm from "../organisms/SecuritySettingsForm";
import { toast } from "sonner";

const SettingsPage = () => {
  const { securitySettings, securityLoading, securityError } =
    useSecuritySettings();
  const { updateSecuritySettings, isLoading: isSaving } =
    useUpdateSecuritySettings();
  console.log(securitySettings, securityLoading, securityError);

  if (securityError) {
    console.error("Rendering error message:", securityError);
    return <ErrorMessage message={extractErrorMessage(securityError)} />;
  }

  if (securityLoading || !securitySettings) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <LoadingOverlayInformation text="Loading security informations..." />
      </div>
    );
  }

  const handleSave = async (settings: typeof securitySettings) => {
    try {
      await updateSecuritySettings(settings);
      toast.success("Security settings saved successfully");
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <div className="p-6">
      <SecuritySettingsForm
        initialSettings={securitySettings}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};

export default SettingsPage;
