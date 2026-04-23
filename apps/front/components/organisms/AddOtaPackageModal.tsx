"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  SelectAdmin as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileDropzone } from "@/components/molecules/FileDropzone";
import {
  CreateOtaPackageRequest,
  ChecksumAlgorithm,
  CHECKSUM_ALGORITHM_OPTIONS,
} from "@/types/otaPackageTypes";
import { OtaPackageService } from "@/lib/services/thingsboardServices/otaPackageService";

interface DeviceProfileInfo {
  id: { entityType: string; id: string };
  name: string;
}

interface AddOtaPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (payload: CreateOtaPackageRequest) => Promise<void>;
  isSaving: boolean;
}

export function AddOtaPackageModal({
  isOpen,
  onClose,
  onAdd,
  isSaving,
}: AddOtaPackageModalProps) {
  const [uploadType, setUploadType] = useState<"upload" | "url">("upload");
  // Form State
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const [tag, setTag] = useState("");
  const [selectedDeviceProfileId, setSelectedDeviceProfileId] = useState("");
  const [type, setType] = useState<"FIRMWARE" | "SOFTWARE">("FIRMWARE");
  const [url, setUrl] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [checksumAlgorithm, setChecksumAlgorithm] =
    useState<ChecksumAlgorithm>("SHA256");
  const [checksum, setChecksum] = useState("");
  const [description, setDescription] = useState("");

  // Device profile infos
  const [deviceProfiles, setDeviceProfiles] = useState<DeviceProfileInfo[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingProfiles(true);
      OtaPackageService.getDeviceProfileInfos()
        .then((response) => {
          setDeviceProfiles(response.data || []);
        })
        .catch(() => {
          setDeviceProfiles([]);
        })
        .finally(() => {
          setIsLoadingProfiles(false);
        });
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setVersion("");
    setTag("");
    setSelectedDeviceProfileId("");
    setType("FIRMWARE");
    setUrl("");
    setSelectedFiles([]);
    setChecksum("");
    setDescription("");
    setUploadType("upload");
    setChecksumAlgorithm("SHA256");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !version || !selectedDeviceProfileId) return;

    const isURL = uploadType === "url";

    const payload: CreateOtaPackageRequest = {
      title,
      version,
      tag: tag || `${title} ${version}`,
      type,
      deviceProfileId: {
        entityType: "DEVICE_PROFILE",
        id: selectedDeviceProfileId,
      },
      isURL,
    };

    if (isURL && url) {
      payload.url = url;
    }

    if (!isURL && checksum) {
      payload.checksumAlgorithm = checksumAlgorithm;
      payload.checksum = checksum;
    }

    if (description) {
      payload.additionalInfo = { description };
    }

    try {
      await onAdd(payload);
      onClose();
      resetForm();
    } catch {
      // error handled by parent
    }
  };

  const isFormValid =
    title &&
    version &&
    selectedDeviceProfileId &&
    (uploadType === "upload" || url);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-137.5 overflow-y-auto max-h-[90vh]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="dark:text-white">Add package</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Title + Version row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="dark:text-white">Title*</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title*"
                  required
                  className="dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-white">Version*</Label>
                <Input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="Version*"
                  required
                  className="dark:text-white"
                />
              </div>
            </div>

            {/* Version tag */}
            <div className="space-y-1">
              <Label className="dark:text-white">Version tag</Label>
              <Input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Version tag"
                className="dark:text-white"
              />
              <p className="text-xs text-muted-foreground">
                Custom tag should match the package version reported by your
                device.
              </p>
            </div>

            {/* Device profile dropdown */}
            <div className="space-y-1">
              <Label className="dark:text-white">Device profile*</Label>
              <Select
                value={selectedDeviceProfileId}
                onValueChange={setSelectedDeviceProfileId}
                disabled={isLoadingProfiles}
              >
                <SelectTrigger className="w-full dark:text-white">
                  <SelectValue
                    placeholder={
                      isLoadingProfiles
                        ? "Loading profiles..."
                        : "Select device profile"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {deviceProfiles.map((profile) => (
                    <SelectItem key={profile.id.id} value={profile.id.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The uploaded package will be available only for devices with the
                chosen profile.
              </p>
            </div>

            {/* Package type */}
            <div className="space-y-1">
              <Label className="dark:text-white">Package type*</Label>
              <Select
                value={type}
                onValueChange={(val: string) =>
                  setType(val as "FIRMWARE" | "SOFTWARE")
                }
              >
                <SelectTrigger className="w-full dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIRMWARE">Firmware</SelectItem>
                  <SelectItem value="SOFTWARE">Software</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Once the package is uploaded, you will not be able to modify
                title, version, device profile and package type.
              </p>
            </div>

            {/* Upload type radio */}
            <RadioGroup
              value={uploadType}
              onValueChange={(val: string) =>
                setUploadType(val as "upload" | "url")
              }
              className="flex items-center gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="upload-binary" />
                <Label
                  htmlFor="upload-binary"
                  className="cursor-pointer dark:text-white"
                >
                  Upload binary file
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="url" id="use-url" />
                <Label
                  htmlFor="use-url"
                  className="cursor-pointer dark:text-white"
                >
                  Use external URL
                </Label>
              </div>
            </RadioGroup>

            {uploadType === "url" ? (
              /* External URL mode */
              <div className="space-y-2">
                <Label className="dark:text-white">Direct URL*</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Direct URL*"
                  required
                  className="dark:text-white"
                />
              </div>
            ) : (
              /* Upload binary mode */
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="dark:text-white">Package file*</Label>
                  <FileDropzone
                    onFilesSelected={setSelectedFiles}
                    selectedFiles={selectedFiles}
                    onRemoveFile={() => setSelectedFiles([])}
                  />
                </div>

                {/* Checksum section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="dark:text-white">
                      Checksum algorithm
                    </Label>
                    <Select
                      value={checksumAlgorithm}
                      onValueChange={(val: string) =>
                        setChecksumAlgorithm(val as ChecksumAlgorithm)
                      }
                    >
                      <SelectTrigger className="dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHECKSUM_ALGORITHM_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-white">Checksum</Label>
                    <Input
                      value={checksum}
                      onChange={(e) => setChecksum(e.target.value)}
                      placeholder="Checksum"
                      className="dark:text-white"
                    />
                    <p className="text-xs text-muted-foreground">
                      If checksum is empty, it will be generated automatically
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label className="dark:text-white">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                resetForm();
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !isFormValid}>
              {isSaving ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
