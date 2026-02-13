"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tenant, TenantProfile } from "@/lib/types/dashboardTypes";
import { TenantMultiSelect } from "@/components/molecules/TenantMultiSelect";
import { TenantProfileMultiSelect } from "@/components/molecules/TenantProfileMultiSelect";
import { Textarea } from "@/components/ui/textarea";

interface CreateRecipientGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

type UserFilterType =
    | "ALL_USERS"
    | "TENANT_ADMINISTRATORS"
    | "SYSTEM_ADMINISTRATORS";

type SelectionMode = "tenant" | "profile";

export function CreateRecipientGroupDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateRecipientGroupDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [userFilter, setUserFilter] =
        useState<UserFilterType>("ALL_USERS");
    const [selectionMode, setSelectionMode] =
        useState<SelectionMode>("tenant");
    const [selectedTenants, setSelectedTenants] = useState<Tenant[]>([]);
    const [selectedProfiles, setSelectedProfiles] = useState<TenantProfile[]>(
        [],
    );
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !userFilter) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
            // Prepare request payload
            const request = {
                name,
                configuration: {
                    type: "PLATFORM_USERS" as const,
                    usersFilter: {
                        type: userFilter,
                        ...(userFilter === "TENANT_ADMINISTRATORS" &&
                            selectionMode === "tenant" &&
                            selectedTenants.length > 0 && {
                            tenantsIds: selectedTenants.map((t) => t.id.id),
                        }),
                        ...(userFilter === "TENANT_ADMINISTRATORS" &&
                            selectionMode === "profile" &&
                            selectedProfiles.length > 0 && {
                            tenantProfilesIds: selectedProfiles.map(
                                (p) => p.id.id,
                            ),
                        }),
                    },
                    description: description || null,
                },
            };

            // Call API to create notification target
            const response = await fetch(
                "/api/thingsboard/notification/target",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(request),
                },
            );

            if (!response.ok) {
                throw new Error("Failed to create recipient group");
            }

            toast.success("Recipient group created successfully");
            onSuccess();
            onOpenChange(false);

            // Reset form
            setName("");
            setUserFilter("ALL_USERS");
            setSelectionMode("tenant");
            setSelectedTenants([]);
            setSelectedProfiles([]);
            setDescription("");
        } catch (error) {
            console.error("Failed to create recipient group:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to create recipient group",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const showTenantSelection = userFilter === "TENANT_ADMINISTRATORS";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] overflow-visible">
                <DialogHeader>
                    <DialogTitle>Add notification recipients group</DialogTitle>
                    <DialogDescription>
                        Create a new group of recipients for notifications.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Name<span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter recipient group name"
                            required
                        />
                    </div>

                    {/* Type - Always Platform users for now */}
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted text-muted-foreground">
                            Platform users
                        </div>
                    </div>

                    {/* User filter */}
                    <div className="space-y-2">
                        <Label htmlFor="userFilter">
                            User filter<span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={userFilter}
                            onValueChange={(value) =>
                                setUserFilter(value as UserFilterType)
                            }
                            options={[
                                { value: "ALL_USERS", label: "All users" },
                                {
                                    value: "TENANT_ADMINISTRATORS",
                                    label: "Tenant administrators",
                                },
                                {
                                    value: "SYSTEM_ADMINISTRATORS",
                                    label: "System administrators",
                                },
                            ]}
                            placeholder="Select user filter"
                        />
                    </div>

                    {/* Tenant selection (conditional) */}
                    {showTenantSelection && (
                        <>
                            {/* Tab buttons */}
                            <div className="flex gap-1 border-b">
                                <button
                                    type="button"
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${selectionMode === "tenant"
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    onClick={() => setSelectionMode("tenant")}
                                >
                                    Tenant
                                </button>
                                <button
                                    type="button"
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${selectionMode === "profile"
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    onClick={() => setSelectionMode("profile")}
                                >
                                    Tenant profile
                                </button>
                            </div>

                            {/* Conditional content based on selection mode */}
                            {selectionMode === "tenant" ? (
                                <TenantMultiSelect
                                    selectedTenants={selectedTenants}
                                    onTenantsChange={setSelectedTenants}
                                    label="Tenants"
                                    placeholder="Select tenants..."
                                    hint="If empty, the trigger will be applied to all tenants"
                                />
                            ) : (
                                <TenantProfileMultiSelect
                                    selectedProfiles={selectedProfiles}
                                    onProfilesChange={setSelectedProfiles}
                                    label="Tenant Profiles"
                                    placeholder="Select tenant profiles..."
                                    hint="If empty, the trigger will be applied to all tenant profiles"
                                />
                            )}
                        </>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Add
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
