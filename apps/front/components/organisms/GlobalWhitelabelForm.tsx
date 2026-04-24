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

const WHITELABEL_LOGO_UPDATED_EVENT = "whitelabel-logo-updated";
const WHITELABEL_LOGO_VERSION_KEY = "whitelabel-logo-version";
const WHITELABEL_CSS_UPDATED_EVENT = "whitelabel-css-updated";
const WHITELABEL_CSS_VERSION_KEY = "whitelabel-css-version";

export const GlobalWhitelabelForm = () => {
  const formId = useId();
  const [logoWhiteFile, setLogoWhiteFile] = useState<File | null>(null);
  const [logoDarkFile, setLogoDarkFile] = useState<File | null>(null);
  const [lightColorsCssFile, setLightColorsCssFile] = useState<File | null>(
    null,
  );
  const [isUploadingLogos, setIsUploadingLogos] = useState(false);
  const [isUploadingCss, setIsUploadingCss] = useState(false);

  const handleUploadLogos = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!logoWhiteFile && !logoDarkFile) {
      toast.error("Please select at least one logo to upload.");
      return;
    }

    setIsUploadingLogos(true);
    try {
      const formData = new FormData();
      if (logoWhiteFile) formData.append("logoWhite", logoWhiteFile);
      if (logoDarkFile) formData.append("logoDark", logoDarkFile);

      const response =
        await TenantService.uploadGlobalWhitelabelImages(formData);

      if (!response.success) {
        throw new Error("Error during file upload");
      }

      if (response.version) {
        window.localStorage.setItem(
          WHITELABEL_LOGO_VERSION_KEY,
          response.version,
        );
        window.dispatchEvent(
          new CustomEvent(WHITELABEL_LOGO_UPDATED_EVENT, {
            detail: response.version,
          }),
        );
      }

      toast.success("Logos uploaded successfully.");
      setLogoWhiteFile(null);
      setLogoDarkFile(null);
    } catch (error) {
      toast.error("An error occurred during logo upload.");
      console.error(error);
    } finally {
      setIsUploadingLogos(false);
    }
  };

  const handleUploadCss = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lightColorsCssFile) {
      toast.error("Please select a CSS file to upload.");
      return;
    }

    setIsUploadingCss(true);
    try {
      const formData = new FormData();
      formData.append("lightColorsCss", lightColorsCssFile);

      const response =
        await TenantService.uploadGlobalWhitelabelImages(formData);

      if (!response.success) {
        throw new Error("Error during file upload");
      }

      if (response.cssVersion) {
        window.localStorage.setItem(
          WHITELABEL_CSS_VERSION_KEY,
          response.cssVersion,
        );
        window.dispatchEvent(
          new CustomEvent(WHITELABEL_CSS_UPDATED_EVENT, {
            detail: response.cssVersion,
          }),
        );
      }

      toast.success("Light theme CSS uploaded successfully.");
      setLightColorsCssFile(null);
    } catch (error) {
      toast.error("An error occurred during CSS upload.");
      console.error(error);
    } finally {
      setIsUploadingCss(false);
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
                <p>Upload global logos and theme colors for the platform.</p>
                <p>
                  These will be used if a tenant has not configured their own
                  settings.
                </p>
              </div>
            }
          />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        {/* Logo Upload Section */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4">Upload Logos</h3>
          <form
            id={`${formId}-logos`}
            onSubmit={handleUploadLogos}
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
                Recommended format: PNG, SVG. Displayed when UI is in light
                mode.
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

            <div className="flex flex-row gap-3 ml-auto">
              <LoadingButton
                type="submit"
                className="w-fit h-9 gap-2"
                isLoading={isUploadingLogos}
                textBeforeClick="Upload Images"
                textAfterClick="Uploading..."
                disabled={isUploadingLogos || (!logoWhiteFile && !logoDarkFile)}
              />
            </div>
          </form>
        </div>

        {/* CSS Upload Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Upload Light Theme CSS</h3>
          <form
            id={`${formId}-css`}
            onSubmit={handleUploadCss}
            className="space-y-6 flex flex-col"
          >
            <div className="space-y-2">
              <Label htmlFor={`${formId}-lightColorsCss`}>
                Light Theme CSS File
              </Label>
              <input
                id={`${formId}-lightColorsCss`}
                type="file"
                accept=".css,text/css"
                onChange={(e) =>
                  setLightColorsCssFile(e.target.files?.[0] || null)
                }
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <p className="text-sm text-muted-foreground">
                Upload light-colors.css. Changes will be visible after page
                reload.
              </p>
            </div>

            <div className="flex flex-row gap-3 ml-auto">
              <LoadingButton
                type="submit"
                className="w-fit h-9 gap-2"
                isLoading={isUploadingCss}
                textBeforeClick="Upload CSS"
                textAfterClick="Uploading..."
                disabled={isUploadingCss || !lightColorsCssFile}
              />
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalWhitelabelForm;
