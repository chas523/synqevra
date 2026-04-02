"use client";

import { useCallback, useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import { EntitiesDeviceProfilesTable } from "@/components/organisms/EntitiesDeviceProfilesTable";
import { AddDeviceProfileDialog } from "@/components/organisms/AddDeviceProfileDialog";
import { DeviceProfileDetailPanel } from "@/components/organisms/DeviceProfileDetailPanel";
import { useEntityDeviceProfiles } from "@/hooks/thingsboard/device-profile/useEntityDeviceProfiles";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import type {
  CreateDeviceProfileRequest,
  DeviceProfile,
} from "@/lib/services/thingsboardServices/deviceService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export const EntitiesDeviceProfilesPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [profileToMakeDefault, setProfileToMakeDefault] =
    useState<DeviceProfile | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<DeviceProfile | null>(
    null,
  );
  const [isMakingDefault, setIsMakingDefault] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<DeviceProfile | null>(
    null,
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchText(searchText.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  const { mutate: globalMutate } = useSWRConfig();

  const { deviceProfiles, totalPages, totalElements, isLoading, mutate } =
    useEntityDeviceProfiles(
      currentPage,
      PAGE_SIZE,
      sortProperty,
      sortOrder,
      debouncedSearchText,
    );

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchText]);

  const handleSortChange = useCallback(
    (property: string, order: "ASC" | "DESC") => {
      setSortProperty(property);
      setSortOrder(order);
      setCurrentPage(0);
    },
    [],
  );

  const handleExport = useCallback(async (profile: DeviceProfile) => {
    try {
      const exported = await DeviceService.exportDeviceProfile(
        profile.id?.id ?? "",
        true,
      );
      const exportPayload = DeviceService.toDeviceProfileExport(exported);
      const content = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${profile.name || "device-profile"}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`Device profile "${profile.name}" exported`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to export profile");
    }
  }, []);

  const handleMakeDefault = useCallback(async (profile: DeviceProfile) => {
    setProfileToMakeDefault(profile);
  }, []);

  const handleCreateProfile = useCallback(
    async (payload: CreateDeviceProfileRequest) => {
      try {
        await DeviceService.createDeviceProfile(payload);
        toast.success(`Device profile "${payload.name}" created`);
        setIsAddDialogOpen(false);
        mutate();
      } catch (error: any) {
        const message =
          error?.response?.data?.message || "Failed to create device profile";
        toast.error(message);
        throw error;
      }
    },
    [mutate],
  );

  const confirmMakeDefault = useCallback(async () => {
    if (!profileToMakeDefault) {
      return;
    }

    try {
      setIsMakingDefault(true);
      await DeviceService.makeDeviceProfileDefault(
        profileToMakeDefault.id?.id ?? "",
      );
      toast.success(`"${profileToMakeDefault.name}" is now default`);
      setProfileToMakeDefault(null);
      mutate();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to set device profile as default",
      );
    } finally {
      setIsMakingDefault(false);
    }
  }, [mutate, profileToMakeDefault]);

  const handleDelete = useCallback(async (profile: DeviceProfile) => {
    setProfileToDelete(profile);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!profileToDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await DeviceService.deleteDeviceProfile(profileToDelete.id?.id ?? "");
      toast.success(`"${profileToDelete.name}" deleted`);
      setProfileToDelete(null);
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete profile");
    } finally {
      setIsDeleting(false);
    }
  }, [mutate, profileToDelete]);

  const searchAction = (
    <div className="flex items-center gap-2">
      {isSearchOpen && (
        <div className="relative w-56">
          <Input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search profiles"
            className="pr-8"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => setSearchText("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-lg border"
        onClick={() => {
          setIsSearchOpen((current) => {
            const next = !current;
            if (!next) {
              setSearchText("");
            }
            return next;
          });
        }}
        aria-label="Search profiles"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <>
      <EntitiesDeviceProfilesTable
        deviceProfiles={deviceProfiles}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onPageChange={setCurrentPage}
        onRefresh={() => {
          mutate();
          if (selectedProfile?.id?.id) {
            globalMutate(
              (key: unknown) =>
                Array.isArray(key) && key[1] === selectedProfile.id.id,
            );
          }
        }}
        onRowClick={(profile) => setSelectedProfile(profile)}
        onExport={handleExport}
        onMakeDefault={handleMakeDefault}
        onDelete={handleDelete}
        onAdd={() => setIsAddDialogOpen(true)}
        customAction={searchAction}
      />

      <DeviceProfileDetailPanel
        profile={selectedProfile}
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />

      <AddDeviceProfileDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleCreateProfile}
      />

      <Dialog
        open={!!profileToMakeDefault}
        onOpenChange={(open) => {
          if (!open && !isMakingDefault) {
            setProfileToMakeDefault(null);
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={!isMakingDefault}
        >
          <DialogHeader>
            <DialogTitle>Set Device Profile as Default</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to set the device profile '${profileToMakeDefault?.name ?? ""}' as the default profile?`}
            </DialogDescription>
            <DialogDescription>
              After confirmation, this profile will be marked as default and
              will be used for new devices when no profile is specified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProfileToMakeDefault(null)}
              disabled={isMakingDefault}
            >
              Cancel
            </Button>
            <Button onClick={confirmMakeDefault} disabled={isMakingDefault}>
              {isMakingDefault ? "Saving..." : "Set as Default"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!profileToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setProfileToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={!isDeleting}>
          <DialogHeader>
            <DialogTitle>Delete Device Profile</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to delete the device profile '${profileToDelete?.name ?? ""}'?`}
            </DialogDescription>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProfileToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
