"use client";

import Select from "@/components/molecules/PortalSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";

type ProvisioningTabProps = {
  provisionType: string;
  provisionTypeOptions: Array<{ value: string; label: string }>;
  usesCredentialProvisioning: boolean;
  usesX509Provisioning: boolean;
  isSaving: boolean;
  provisionDeviceKey: string;
  provisionDeviceSecret: string;
  provisionAllowCreateNewDevicesByX509Certificate: boolean;
  provisionCertificateValue: string;
  provisionCertificateRegExPattern: string;
  x509DefaultRegex: string;
  onProvisionTypeChange: (value: string) => void;
  onProvisionDeviceKeyChange: (value: string) => void;
  onProvisionDeviceSecretChange: (value: string) => void;
  onEnsureProvisionCredential: (
    field: "provisionDeviceKey" | "provisionDeviceSecret",
  ) => void;
  onToggleAllowCreateByX509: (checked: boolean) => void;
  onProvisionCertificateValueChange: (value: string) => void;
  onProvisionCertificateRegexChange: (value: string) => void;
};

export function ProvisioningTab({
  provisionType,
  provisionTypeOptions,
  usesCredentialProvisioning,
  usesX509Provisioning,
  isSaving,
  provisionDeviceKey,
  provisionDeviceSecret,
  provisionAllowCreateNewDevicesByX509Certificate,
  provisionCertificateValue,
  provisionCertificateRegExPattern,
  x509DefaultRegex,
  onProvisionTypeChange,
  onProvisionDeviceKeyChange,
  onProvisionDeviceSecretChange,
  onEnsureProvisionCredential,
  onToggleAllowCreateByX509,
  onProvisionCertificateValueChange,
  onProvisionCertificateRegexChange,
}: ProvisioningTabProps) {
  return (
    <div className="space-y-6 rounded-lg border p-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Provisioning type</label>
        <Select
          value={provisionType}
          onValueChange={onProvisionTypeChange}
          options={provisionTypeOptions}
          placeholder="Select provisioning type"
          disabled={isSaving}
        />
      </div>

      {usesCredentialProvisioning && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="device-profile-provision-key"
              className="text-sm font-medium"
            >
              Provision device key
            </label>
            <div className="flex gap-2">
              <Input
                id="device-profile-provision-key"
                value={provisionDeviceKey}
                onChange={(event) =>
                  onProvisionDeviceKeyChange(event.target.value)
                }
                onBlur={() => onEnsureProvisionCredential("provisionDeviceKey")}
                placeholder="Generated automatically if empty"
                disabled={isSaving}
              />
              {!provisionDeviceKey.trim() && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    onEnsureProvisionCredential("provisionDeviceKey")
                  }
                  disabled={isSaving}
                  aria-label="Generate provision device key"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="device-profile-provision-secret"
              className="text-sm font-medium"
            >
              Provision device secret
            </label>
            <div className="flex gap-2">
              <Input
                id="device-profile-provision-secret"
                value={provisionDeviceSecret}
                onChange={(event) =>
                  onProvisionDeviceSecretChange(event.target.value)
                }
                onBlur={() =>
                  onEnsureProvisionCredential("provisionDeviceSecret")
                }
                placeholder="Generated automatically if empty"
                disabled={isSaving}
              />
              {!provisionDeviceSecret.trim() && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    onEnsureProvisionCredential("provisionDeviceSecret")
                  }
                  disabled={isSaving}
                  aria-label="Generate provision device secret"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {usesX509Provisioning && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Create new devices</div>
              <p className="text-sm text-muted-foreground">
                Allow certificate-based provisioning to create a new device when
                no matching device exists.
              </p>
            </div>
            <Switch
              checked={provisionAllowCreateNewDevicesByX509Certificate}
              onCheckedChange={onToggleAllowCreateByX509}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="device-profile-provision-certificate"
              className="text-sm font-medium"
            >
              PEM certificate
            </label>
            <Textarea
              id="device-profile-provision-certificate"
              value={provisionCertificateValue}
              onChange={(event) =>
                onProvisionCertificateValueChange(event.target.value)
              }
              placeholder="-----BEGIN CERTIFICATE-----"
              className="min-h-32 font-mono text-xs"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="device-profile-provision-regex"
              className="text-sm font-medium"
            >
              CN Regular Expression variable
            </label>
            <Input
              id="device-profile-provision-regex"
              value={provisionCertificateRegExPattern}
              onChange={(event) =>
                onProvisionCertificateRegexChange(event.target.value)
              }
              placeholder={x509DefaultRegex}
              disabled={isSaving}
            />
          </div>
        </div>
      )}

      {provisionType === "DISABLED" && (
        <p className="text-sm text-muted-foreground">
          Device provisioning is disabled for this profile.
        </p>
      )}
    </div>
  );
}
