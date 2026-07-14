"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface DeviceProfileProvisioningTabContentProps {
  profileId: string;
}

type ProvisionType =
  | "DISABLED"
  | "ALLOW_CREATE_NEW_DEVICES"
  | "CHECK_PRE_PROVISIONED_DEVICES"
  | "X509_CERTIFICATE_CHAIN";

type ProvisioningFormState = {
  provisionType: ProvisionType;
  provisionDeviceKey: string;
  provisionDeviceSecret: string;
  provisionCertificateValue: string;
  provisionCertificateRegExPattern: string;
  provisionAllowCreateNewDevicesByX509Certificate: boolean;
};

const X509_DEFAULT_REGEX = "(.*)";

const generateToken = (length = 20) => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length)),
  ).join("");
};

const toFormState = (profile: any): ProvisioningFormState => {
  const config = profile.profileData?.provisionConfiguration ?? {};
  const provisionType = (profile.provisionType || "DISABLED") as ProvisionType;

  return {
    provisionType,
    provisionDeviceKey: profile.provisionDeviceKey || "",
    provisionDeviceSecret:
      provisionType === "X509_CERTIFICATE_CHAIN"
        ? ""
        : config.provisionDeviceSecret || "",
    provisionCertificateValue:
      provisionType === "X509_CERTIFICATE_CHAIN"
        ? config.provisionDeviceSecret || ""
        : "",
    provisionCertificateRegExPattern:
      config.certificateRegExPattern || X509_DEFAULT_REGEX,
    provisionAllowCreateNewDevicesByX509Certificate:
      config.allowCreateNewDevicesByX509Certificate !== false,
  };
};

export function DeviceProfileProvisioningTabContent({
  profileId,
}: DeviceProfileProvisioningTabContentProps) {
  const {
    data: profile,
    isLoading,
    mutate,
  } = useSWR(
    profileId ? ["deviceProfileProvisioning", profileId] : null,
    async () => DeviceService.fetchDeviceProfile(profileId),
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ProvisioningFormState | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm(toFormState(profile));
    setIsEditing(false);
  }, [profile]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!profile || !form) {
    return (
      <div className="p-4 text-center text-slate-500">
        Device provisioning data not found.
      </div>
    );
  }

  const isFormDisabled = !isEditing || isSaving;
  const usesCredentialProvisioning =
    form.provisionType === "ALLOW_CREATE_NEW_DEVICES" ||
    form.provisionType === "CHECK_PRE_PROVISIONED_DEVICES";
  const usesX509Provisioning = form.provisionType === "X509_CERTIFICATE_CHAIN";

  const handleCancel = () => {
    setForm(toFormState(profile));
    setIsEditing(false);
  };

  const ensureProvisionCredential = (
    field: "provisionDeviceKey" | "provisionDeviceSecret",
  ) => {
    setForm((prev) => {
      if (!prev || prev[field].trim()) {
        return prev;
      }

      return {
        ...prev,
        [field]: generateToken(),
      };
    });
  };

  const handleSave = async () => {
    let provisionDeviceKey: string | null = null;
    let provisionConfiguration: any = {
      type: "DISABLED",
      provisionDeviceSecret: null,
    };

    if (usesCredentialProvisioning) {
      if (
        !form.provisionDeviceKey.trim() ||
        !form.provisionDeviceSecret.trim()
      ) {
        toast.error("Provision device key and secret are required");
        return;
      }

      provisionDeviceKey = form.provisionDeviceKey.trim();
      provisionConfiguration = {
        type: form.provisionType,
        provisionDeviceSecret: form.provisionDeviceSecret.trim(),
      };
    }

    if (usesX509Provisioning) {
      if (!form.provisionCertificateValue.trim()) {
        toast.error("PEM certificate is required");
        return;
      }

      if (!form.provisionCertificateRegExPattern.trim()) {
        toast.error("CN Regular Expression variable is required");
        return;
      }

      provisionConfiguration = {
        type: "X509_CERTIFICATE_CHAIN",
        provisionDeviceSecret: form.provisionCertificateValue.trim(),
        certificateRegExPattern:
          form.provisionCertificateRegExPattern.trim() || X509_DEFAULT_REGEX,
        allowCreateNewDevicesByX509Certificate:
          form.provisionAllowCreateNewDevicesByX509Certificate,
      };
    }

    const payload = {
      ...profile,
      provisionType: provisionConfiguration.type,
      provisionDeviceKey,
      profileData: {
        ...profile.profileData,
        provisionConfiguration,
      },
    };

    setIsSaving(true);
    try {
      await DeviceService.updateDeviceProfile(payload);
      await mutate();
      toast.success("Device provisioning updated");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update device provisioning",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {!isEditing ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </>
        )}
      </div>

      <div className="space-y-6 rounded-lg border p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Provisioning type</label>
          <Select
            value={form.provisionType}
            onValueChange={(value) =>
              setForm((prev) =>
                prev
                  ? {
                      ...prev,
                      provisionType: (value as ProvisionType) ?? "DISABLED",
                    }
                  : prev,
              )
            }
            options={[
              { value: "DISABLED", label: "Disabled" },
              {
                value: "ALLOW_CREATE_NEW_DEVICES",
                label: "Allow to create new devices",
              },
              {
                value: "CHECK_PRE_PROVISIONED_DEVICES",
                label: "Check for pre-provisioned devices",
              },
              {
                value: "X509_CERTIFICATE_CHAIN",
                label: "X509 Certificates Chain",
              },
            ]}
            placeholder="Select provisioning type"
            disabled={isFormDisabled}
          />
        </div>

        {usesCredentialProvisioning && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Provision device key
              </label>
              <div className="flex gap-2">
                <Input
                  value={form.provisionDeviceKey}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? { ...prev, provisionDeviceKey: event.target.value }
                        : prev,
                    )
                  }
                  onBlur={() => ensureProvisionCredential("provisionDeviceKey")}
                  placeholder="Generated automatically if empty"
                  disabled={isFormDisabled}
                />
                {!form.provisionDeviceKey.trim() && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      ensureProvisionCredential("provisionDeviceKey")
                    }
                    disabled={isFormDisabled}
                    aria-label="Generate provision device key"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Provision device secret
              </label>
              <div className="flex gap-2">
                <Input
                  value={form.provisionDeviceSecret}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? { ...prev, provisionDeviceSecret: event.target.value }
                        : prev,
                    )
                  }
                  onBlur={() =>
                    ensureProvisionCredential("provisionDeviceSecret")
                  }
                  placeholder="Generated automatically if empty"
                  disabled={isFormDisabled}
                />
                {!form.provisionDeviceSecret.trim() && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      ensureProvisionCredential("provisionDeviceSecret")
                    }
                    disabled={isFormDisabled}
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
                  Allow certificate-based provisioning to create a new device
                  when no matching device exists.
                </p>
              </div>
              <Switch
                checked={form.provisionAllowCreateNewDevicesByX509Certificate}
                onCheckedChange={(checked) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          provisionAllowCreateNewDevicesByX509Certificate:
                            checked,
                        }
                      : prev,
                  )
                }
                disabled={isFormDisabled}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">PEM certificate</label>
              <Textarea
                value={form.provisionCertificateValue}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          provisionCertificateValue: event.target.value,
                        }
                      : prev,
                  )
                }
                placeholder="-----BEGIN CERTIFICATE-----"
                className="min-h-32 font-mono text-xs"
                disabled={isFormDisabled}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                CN Regular Expression variable
              </label>
              <Input
                value={form.provisionCertificateRegExPattern}
                onChange={(event) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          provisionCertificateRegExPattern: event.target.value,
                        }
                      : prev,
                  )
                }
                placeholder={X509_DEFAULT_REGEX}
                disabled={isFormDisabled}
              />
            </div>
          </div>
        )}

        {form.provisionType === "DISABLED" && (
          <p className="text-sm text-muted-foreground">
            Device provisioning is disabled for this profile.
          </p>
        )}
      </div>
    </div>
  );
}
