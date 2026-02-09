"use client";

import { useState, useEffect, useRef } from "react";
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
import { Loader2, X, Check } from "lucide-react";
import { TenantService } from "@/lib/services/adminServices/tenantService";
import { toast } from "sonner";
import { Tenant } from "@/lib/types/dashboardTypes";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AddRelationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sourceEntityId: string;
    sourceEntityType: string;
    onSuccess: () => void;
}

export function AddRelationDialog({
    open,
    onOpenChange,
    sourceEntityId,
    sourceEntityType,
    onSuccess,
}: AddRelationDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [relationType, setRelationType] = useState("Contains");
    const [additionalInfo, setAdditionalInfo] = useState("");

    // Multi-select state
    const [selectedTenants, setSelectedTenants] = useState<Tenant[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Tenant[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                searchTenants(searchTerm);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const searchTenants = async (textSearch: string) => {
        setIsSearching(true);
        try {
            const response = await TenantService.getTenants({
                limit: 10,
                textSearch,
            });
            // Filter out already selected tenants
            const filtered = response.data.filter(
                (t) => !selectedTenants.some((st) => st.id.id === t.id.id)
            );
            setSearchResults(filtered);
            setShowResults(true);
        } catch (error) {
            console.error("Failed to search tenants", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectTenant = (tenant: Tenant) => {
        setSelectedTenants([...selectedTenants, tenant]);
        setSearchTerm("");
        setSearchResults([]);
        setShowResults(false);
    };

    const handleRemoveTenant = (tenantId: string) => {
        setSelectedTenants(selectedTenants.filter((t) => t.id.id !== tenantId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTenants.length === 0 || !relationType) return;

        setIsLoading(true);
        try {
            // Create relations for all selected tenants
            await Promise.all(selectedTenants.map(async (tenant) => {
                const relation = {
                    from: {
                        id: sourceEntityId,
                        entityType: sourceEntityType,
                    },
                    to: {
                        id: tenant.id.id,
                        entityType: "TENANT",
                    },
                    type: relationType,
                    typeGroup: "COMMON",
                    additionalInfo: additionalInfo ? JSON.parse(additionalInfo) : null,
                };
                return TenantService.saveRelation(sourceEntityId, relation);
            }));

            toast.success(`Successfully added relations to ${selectedTenants.length} tenants`);
            onSuccess();
            onOpenChange(false);

            // Reset form
            setSelectedTenants([]);
            setAdditionalInfo("");
            setSearchTerm("");
        } catch (error) {
            console.error("Failed to add relations:", error);
            toast.error(error instanceof Error ? error.message : "Failed to add relations");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] overflow-visible">
                <DialogHeader>
                    <DialogTitle>Add relation</DialogTitle>
                    <DialogDescription>
                        Create a new relation from this entity to one or more tenants.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="relationType">Relation type*</Label>
                        <Input
                            id="relationType"
                            value={relationType}
                            onChange={(e) => setRelationType(e.target.value)}
                            placeholder="e.g. Contains"
                            required
                        />
                    </div>

                    <div className="space-y-2 relative" ref={searchRef}>
                        <Label>To entity (Tenants)*</Label>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-background">
                            {selectedTenants.map((tenant) => (
                                <Badge key={tenant.id.id} variant="secondary" className="gap-1 pr-1">
                                    {tenant.title || tenant.name}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTenant(tenant.id.id)}
                                        className="hover:bg-muted rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">Remove</span>
                                    </button>
                                </Badge>
                            ))}
                            <input
                                className="flex-1 bg-transparent outline-none min-w-[120px] text-sm"
                                placeholder={selectedTenants.length === 0 ? "Select tenants..." : ""}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => {
                                    if (searchTerm) setShowResults(true);
                                }}
                            />
                        </div>

                        {/* Dropdown Results */}
                        {showResults && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover text-popover-foreground border rounded-md shadow-md max-h-[200px] overflow-auto py-1">
                                {searchResults.map((tenant) => (
                                    <button
                                        key={tenant.id.id}
                                        type="button"
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between group"
                                        onClick={() => handleSelectTenant(tenant)}
                                    >
                                        <span>{tenant.title || tenant.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {showResults && isSearching && (
                            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-2 text-center text-sm text-muted-foreground">
                                Searching...
                            </div>
                        )}
                        {showResults && !isSearching && searchResults.length === 0 && searchTerm && (
                            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-2 text-center text-sm text-muted-foreground">
                                No tenants found
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="additionalInfo">Additional info (JSON)</Label>
                        <textarea
                            id="additionalInfo"
                            value={additionalInfo}
                            onChange={(e) => setAdditionalInfo(e.target.value)}
                            placeholder='{"key": "value"}'
                            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 font-mono"
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
                        <Button type="submit" disabled={isLoading || selectedTenants.length === 0}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
