"use client";

import { useId, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import InfoTooltip from "@/components/molecules/InfoTooltip";
import { LoadingButton } from "../atoms";
import { TenantService } from "@/lib/services/adminServices/tenantService";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const WHITELABEL_LOGO_UPDATED_EVENT = "whitelabel-logo-updated";
const WHITELABEL_LOGO_VERSION_KEY = "whitelabel-logo-version";

export const GlobalWhitelabelForm = () => {
  const formId = useId();
  const [logoWhiteFile, setLogoWhiteFile] = useState<File | null>(null);
  const [logoDarkFile, setLogoDarkFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!logoWhiteFile && !logoDarkFile) {
      toast.error("Please select at least one file to upload.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      if (logoWhiteFile) formData.append("logoWhite", logoWhiteFile);
      if (logoDarkFile) formData.append("logoDark", logoDarkFile);

      const response =
        await TenantService.uploadGlobalWhitelabelImages(formData);

      if (!response.success) {
        throw new Error("Error during file upload");
      }

      const version = Date.now().toString();
      window.localStorage.setItem(WHITELABEL_LOGO_VERSION_KEY, version);
      window.dispatchEvent(
        new CustomEvent(WHITELABEL_LOGO_UPDATED_EVENT, {
          detail: version,
        }),
      );

      toast.success("Global whitelabel files uploaded successfully.");
    } catch (error) {
      toast.error("An error occurred during global upload.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Global Whitelabel</CardTitle>
        <CardAction>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>Upload global logos for the platform.</p>
                <p>
                  These will be used if a tenant has not configured their own
                  logos.
                </p>
              </div>
            }
          />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <form
          id={formId}
          onSubmit={handleUpload}
          className="space-y-6 flex flex-col"
        >
          <div className="space-y-2">
            <Label htmlFor={`${formId}-logoWhite`}>Logo (Light Mode)</Label>
            <input
              id={`${formId}-logoWhite`}
              type="file"
              accept="image/png, image/jpeg, image/svg+xml"
              onChange={(e) => setLogoWhiteFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <p className="text-sm text-muted-foreground">
              Recommended format: PNG, SVG. Displayed when UI is in light mode.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${formId}-logoDark`}>Logo (Dark Mode)</Label>
            <input
              id={`${formId}-logoDark`}
              type="file"
              accept="image/png, image/jpeg, image/svg+xml"
              onChange={(e) => setLogoDarkFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <p className="text-sm text-muted-foreground">
              Recommended format: PNG, SVG. Displayed when UI is in dark mode.
            </p>
          </div>

          <div className="flex flex-row gap-3 ml-auto pt-4">
            <LoadingButton
              type="submit"
              className="w-fit h-9 gap-2"
              isLoading={isUploading}
              textBeforeClick="Upload Images"
              textAfterClick="Uploading..."
              disabled={isUploading || (!logoWhiteFile && !logoDarkFile)}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GlobalWhitelabelForm;
