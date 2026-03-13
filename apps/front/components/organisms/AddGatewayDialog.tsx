"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import type { CreateGatewayPayload } from "@/lib/services/thingsboardServices/gatewayService";

interface AddGatewayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateGatewayPayload) => Promise<void>;
}

export function AddGatewayDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddGatewayDialogProps) {
  const [name, setName] = useState("");
  const [deviceProfile, setDeviceProfile] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileOptions, setProfileOptions] = useState<string[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setIsLoadingProfiles(true);
      try {
        const response = await DeviceService.getDeviceProfileInfos();
        setProfileOptions(response.data.map((p) => p.name));
      } catch {
        setProfileOptions([]);
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    load();
  }, [open]);

  const filteredProfiles = useMemo(() => {
    const query = deviceProfile.trim().toLowerCase();
    if (!query) return profileOptions;
    return profileOptions.filter((p) => p.toLowerCase().includes(query));
  }, [deviceProfile, profileOptions]);

  const canSubmit = name.trim().length > 0 && deviceProfile.trim().length > 0;

  const reset = () => {
    setName("");
    setDeviceProfile("");
    setProfileMenuOpen(false);
    setProfileOptions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        type: deviceProfile.trim(),
        label: "",
        additionalInfo: { gateway: true },
      });
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!isSubmitting) {
      if (!next) reset();
      onOpenChange(next);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Gateway</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="gateway-name">Name*</Label>
            <Input
              id="gateway-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Factory Gateway 1"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gateway-device-profile">Device Profile*</Label>
            <div className="relative">
              <Input
                id="gateway-device-profile"
                value={deviceProfile}
                onChange={(e) => {
                  setDeviceProfile(e.target.value);
                  setProfileMenuOpen(true);
                }}
                onFocus={() => setProfileMenuOpen(true)}
                onBlur={() => {
                  setTimeout(() => setProfileMenuOpen(false), 150);
                }}
                placeholder={
                  isLoadingProfiles
                    ? "Loading profiles..."
                    : "Select or type profile name"
                }
                disabled={isSubmitting || isLoadingProfiles}
              />
              {profileMenuOpen && filteredProfiles.length > 0 && (
                <div className="absolute z-50 mt-1 w-full max-h-44 overflow-y-auto rounded-md border border-border bg-popover shadow-md">
                  {filteredProfiles.map((profile) => (
                    <button
                      key={profile}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setDeviceProfile(profile);
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      {profile}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Creating..." : "Create Gateway"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
