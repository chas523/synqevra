"use client";

import { useId, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import InfoTooltip from "@/components/molecules/InfoTooltip";
import { LoadingButton } from "../atoms";
import { useForm, Controller } from "react-hook-form";
import { MailSettings, MailConfig } from "@/types/mailSettingsTypes";

interface MailServerSettingsFormProps {
  initialSettings: MailSettings | null;
  onSave: (settings: MailSettings) => Promise<void>;
  isSaving?: boolean;
}

const PROVIDERS = [
  { value: "CUSTOM", label: "Custom" },
  { value: "GOOGLE", label: "Google" },
  { value: "OFFICE365", label: "Office 365" },
  { value: "SENDGRID", label: "SendGrid" },
];

const TLS_VERSIONS = [
  { value: "TLSv1", label: "TLSv1" },
  { value: "TLSv1.1", label: "TLSv1.1" },
  { value: "TLSv1.2", label: "TLSv1.2" },
  { value: "TLSv1.3", label: "TLSv1.3" },
];

const DEFAULT_MAIL_CONFIG: MailConfig = {
  mailFrom: "",
  smtpProtocol: "smtp",
  smtpHost: "",
  smtpPort: 25,
  timeout: 10000,
  enableTls: false,
  tlsVersion: "TLSv1.2",
  enableProxy: false,
  providerId: "CUSTOM",
  enableOauth2: false,
};

const PROVIDER_TEMPLATES: Record<string, Partial<MailConfig>> = {
  GOOGLE: {
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    enableTls: true,
    smtpProtocol: "smtp",
    authUri:
      "https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline",
    tokenUri: "https://oauth2.googleapis.com/token",
    scope: ["https://mail.google.com/"],
    redirectUriProtocol: "HTTPS",
    redirectUriDomain: "localhost",
  },
  OFFICE365: {
    smtpHost: "smtp.office365.com",
    smtpPort: 587,
    enableTls: true,
    smtpProtocol: "smtp",
    authUri: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUri: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    redirectUriProtocol: "HTTPS",
    redirectUriDomain: "localhost",
  },
  SENDGRID: {
    smtpHost: "smtp.sendgrid.net",
    smtpPort: 587,
    enableTls: true,
    smtpProtocol: "smtp",
    username: "apikey",
  },
};

export const MailServerSettingsForm = ({
  initialSettings,
  onSave,
  isSaving = false,
}: MailServerSettingsFormProps) => {
  const formId = useId();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isDirty, isSubmitting, errors },
    reset,
  } = useForm<MailConfig>({
    mode: "onChange",
    defaultValues: initialSettings?.jsonValue || DEFAULT_MAIL_CONFIG,
  });

  const providerId = watch("providerId");
  const enableOauth2 = watch("enableOauth2");
  const enableProxy = watch("enableProxy");
  const enableTls = watch("enableTls");
  const redirectUriProtocol = watch("redirectUriProtocol") || "HTTPS";
  const redirectUriDomain = watch("redirectUriDomain") || "localhost";

  const redirectUriTemplate = useMemo(() => {
    return `${redirectUriProtocol.toLowerCase()}://${redirectUriDomain}/api/admin/mail/oauth2/callback`;
  }, [redirectUriProtocol, redirectUriDomain]);

  useEffect(() => {
    if (initialSettings?.jsonValue) {
      reset(initialSettings.jsonValue);
    }
  }, [initialSettings, reset]);

  const handleProviderChange = (newProvider: string) => {
    setValue("providerId", newProvider, { shouldDirty: true });
    if (newProvider !== "CUSTOM") {
      const template = PROVIDER_TEMPLATES[newProvider];
      if (template) {
        Object.entries(template).forEach(([key, value]) => {
          setValue(key as keyof MailConfig, value, { shouldDirty: true });
        });
        if (newProvider === "SENDGRID") {
          setValue("enableOauth2", false, { shouldDirty: true });
        }
      }
    }
  };

  const onSubmit = async (data: MailConfig) => {
    if (initialSettings) {
      const updatedSettings: MailSettings = {
        ...initialSettings,
        jsonValue: {
          ...data,
          smtpPort: Number(data.smtpPort),
          redirectUri: enableOauth2 ? redirectUriTemplate : undefined,
        },
      };
      await onSave(updatedSettings);
      reset(data);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Mail Server Settings</CardTitle>
        <CardAction>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>Configure SMTP settings for the application.</p>
                <p>
                  Select a provider for automatic configuration or use 'Custom'
                  for manual setup.
                </p>
              </div>
            }
          />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mail From */}
            <div className="space-y-2">
              <Label htmlFor={`${formId}-mailFrom`}>Mail From *</Label>
              <Input
                id={`${formId}-mailFrom`}
                {...register("mailFrom", { required: "Mail From is required" })}
                placeholder="noreply@example.com"
              />
              {errors.mailFrom && (
                <p className="text-xs text-destructive">
                  {errors.mailFrom.message}
                </p>
              )}
            </div>

            {/* SMTP Provider */}
            <div className="space-y-2">
              <Label htmlFor={`${formId}-providerId`}>SMTP Provider *</Label>
              <Controller
                name="providerId"
                control={control}
                render={({ field }) => (
                  <select
                    id={`${formId}-providerId`}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={field.value}
                    onChange={(e) => handleProviderChange(e.target.value)}
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>

          {/* Connection Settings */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h4 className="font-medium text-sm">Connection Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Protocol</Label>
                <Controller
                  name="smtpProtocol"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="smtp">SMTP</option>
                      <option value="smtps">SMTPS</option>
                    </select>
                  )}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>SMTP Host *</Label>
                <Input
                  {...register("smtpHost", {
                    required: "SMTP Host is required",
                  })}
                  placeholder="smtp.example.com"
                />
                {errors.smtpHost && (
                  <p className="text-xs text-destructive">
                    {errors.smtpHost.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>SMTP Port *</Label>
                <Input
                  type="number"
                  {...register("smtpPort", {
                    required: "SMTP Port is required",
                    valueAsNumber: true,
                  })}
                  placeholder="25"
                />
                {errors.smtpPort && (
                  <p className="text-xs text-destructive">
                    {errors.smtpPort.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Timeout (ms)</Label>
                <Input
                  type="number"
                  {...register("timeout", { valueAsNumber: true })}
                  placeholder="10000"
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Controller
                  name="enableTls"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label>Enable TLS</Label>
              </div>
            </div>

            {enableTls && (
              <div className="space-y-2 pt-2 border-t mt-2">
                <Label>TLS version</Label>
                <Controller
                  name="tlsVersion"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {TLS_VERSIONS.map((v) => (
                        <option key={v.value} value={v.value}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
            )}
          </div>

          {/* Authentication */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm">Authentication</h4>
              {providerId !== "SENDGRID" && (
                <div className="flex items-center space-x-2">
                  <Label className="text-xs">Basic</Label>
                  <Controller
                    name="enableOauth2"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label className="text-xs">OAuth 2.0</Label>
                </div>
              )}
            </div>

            {!enableOauth2 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    {...register("username")}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    {...register("password")}
                    placeholder="Enter password"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client ID *</Label>
                    <Input
                      {...register("clientId", {
                        required: enableOauth2
                          ? "Client ID is required"
                          : false,
                      })}
                      placeholder="OAuth2 Client ID"
                    />
                    {errors.clientId && (
                      <p className="text-xs text-destructive">
                        {errors.clientId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Client Secret *</Label>
                    <Input
                      type="password"
                      {...register("clientSecret", {
                        required: enableOauth2
                          ? "Client Secret is required"
                          : false,
                      })}
                      placeholder="OAuth2 Client Secret"
                    />
                    {errors.clientSecret && (
                      <p className="text-xs text-destructive">
                        {errors.clientSecret.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Authorization URI *</Label>
                    <Input
                      {...register("authUri", {
                        required: enableOauth2
                          ? "Authorization URI is required"
                          : false,
                      })}
                      placeholder="https://..."
                    />
                    {errors.authUri && (
                      <p className="text-xs text-destructive">
                        {errors.authUri.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Token URI *</Label>
                    <Input
                      {...register("tokenUri", {
                        required: enableOauth2
                          ? "Token URI is required"
                          : false,
                      })}
                      placeholder="https://..."
                    />
                    {errors.tokenUri && (
                      <p className="text-xs text-destructive">
                        {errors.tokenUri.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Scope *</Label>
                  <Input
                    {...register("scope", {
                      required: enableOauth2 ? "Scope is required" : false,
                      setValueAs: (v) =>
                        typeof v === "string"
                          ? v.split(" ").filter((s) => s)
                          : v,
                    })}
                    placeholder="Scope (space separated)"
                  />
                  {errors.scope && (
                    <p className="text-xs text-destructive">
                      {errors.scope.message}
                    </p>
                  )}
                </div>

                <div className="p-4 border rounded-lg bg-muted/10 space-y-4">
                  <Label className="text-sm font-semibold">Redirect URI</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Protocol *</Label>
                      <Controller
                        name="redirectUriProtocol"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="HTTPS">HTTPS</option>
                            <option value="HTTP">HTTP</option>
                          </select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Domain name *</Label>
                      <Input
                        {...register("redirectUriDomain", {
                          required: enableOauth2
                            ? "Domain name is required"
                            : false,
                        })}
                        placeholder="localhost"
                      />
                      {errors.redirectUriDomain && (
                        <p className="text-xs text-destructive">
                          {errors.redirectUriDomain.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Redirect URI template
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={redirectUriTemplate}
                        className="bg-muted text-xs font-mono"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigator.clipboard.writeText(redirectUriTemplate)
                        }
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs font-medium">
                    Access token status:{" "}
                    <span className="text-muted-foreground">not generated</span>
                  </span>
                  <Button type="button" size="sm" variant="outline" disabled>
                    Generate access token
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Proxy Settings */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Controller
                name="enableProxy"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label>Enable Proxy</Label>
            </div>

            {enableProxy && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Proxy Host *</Label>
                  <Input
                    {...register("proxyHost", {
                      required: enableProxy ? "Proxy Host is required" : false,
                    })}
                    placeholder="proxy.example.com"
                  />
                  {errors.proxyHost && (
                    <p className="text-xs text-destructive">
                      {errors.proxyHost.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Proxy Port *</Label>
                  <Input
                    type="number"
                    {...register("proxyPort", {
                      required: enableProxy ? "Proxy Port is required" : false,
                      valueAsNumber: true,
                    })}
                    placeholder="1080"
                  />
                  {errors.proxyPort && (
                    <p className="text-xs text-destructive">
                      {errors.proxyPort.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Proxy User</Label>
                  <Input {...register("proxyUser")} placeholder="User" />
                </div>
                <div className="space-y-2">
                  <Label>Proxy Password</Label>
                  <Input
                    type="password"
                    {...register("proxyPassword")}
                    placeholder="Password"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t">
            <div className="flex gap-3 md:ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  reset(initialSettings?.jsonValue || DEFAULT_MAIL_CONFIG)
                }
              >
                Undo
              </Button>
              <LoadingButton
                type="submit"
                isLoading={isSaving || isSubmitting}
                textBeforeClick="Save"
                textAfterClick="Saving..."
                disabled={!isDirty || isSaving || isSubmitting}
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MailServerSettingsForm;
