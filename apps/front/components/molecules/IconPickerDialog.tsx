"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

interface IconPickerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectIcon: (iconName: string) => void;
    currentIcon?: string;
}

export function IconPickerDialog({
    open,
    onOpenChange,
    onSelectIcon,
    currentIcon,
}: IconPickerDialogProps) {
    const [icons, setIcons] = useState<string[]>([]);
    const [filteredIcons, setFilteredIcons] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(currentIcon || "notifications");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const iconsPerPage = 56; // 7 rows x 8 columns

    // Calculate pagination
    const totalPages = Math.ceil(filteredIcons.length / iconsPerPage);
    const startIndex = (currentPage - 1) * iconsPerPage;
    const endIndex = startIndex + iconsPerPage;
    const paginatedIcons = filteredIcons.slice(startIndex, endIndex);

    useEffect(() => {
        if (open && icons.length === 0) {
            loadIcons();
        }
    }, [open]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredIcons(icons);
        } else {
            setFilteredIcons(
                icons.filter((icon) =>
                    icon.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
        // Reset to page 1 when search changes
        setCurrentPage(1);
    }, [searchQuery, icons]);

    const loadIcons = async () => {
        setIsLoading(true);
        try {
            // Fetch from ThingsBoard via Next.js rewrite proxy
            const response = await fetch("/tb-assets/metadata/material-icons.json");
            const data = await response.json();

            // Material icons JSON contains objects with {name, tags}, extract and validate names
            const iconsArray = Array.isArray(data)
                ? data
                    .map((icon: any) => typeof icon === 'string' ? icon : icon.name)
                    .filter((name: string, index: number, self: string[]) => {
                        // Support both Material Icons (Google font) and MDI (SVG files)
                        // Ensure uniqueness to avoid duplicate key errors
                        return name && self.indexOf(name) === index;
                    })
                : [];

            if (iconsArray.length === 0) {
                console.warn("No icons received from backend, using fallback");
                throw new Error("Empty icons array");
            }

            console.log(`Loaded ${iconsArray.length} valid Material Icons`);
            // The JSON contains an array of icon names
            setIcons(iconsArray);
            setFilteredIcons(iconsArray);
        } catch (error) {
            console.error("Failed to load icons:", error);
            // Fallback to common icons if loading fails
            const fallbackIcons = [
                "notifications",
                "warning",
                "error",
                "info",
                "check_circle",
                "alarm",
                "event",
                "schedule",
                "home",
                "settings",
            ];
            setIcons(fallbackIcons);
            setFilteredIcons(fallbackIcons);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = () => {
        onSelectIcon(selectedIcon);
        onOpenChange(false);
    };

    // Render icon based on type (Material Icons font or MDI SVG)
    const renderIcon = (iconName: string) => {
        if (iconName.startsWith('mdi:')) {
            // MDI icons are SVG files from ThingsBoard
            const svgName = iconName.substring(4); // Remove 'mdi:' prefix
            return (
                <img
                    src={`/tb-assets/mdi/${svgName}.svg`}
                    alt={svgName}
                    className="w-6 h-6"
                />
            );
        } else {
            // Material Icons use Google's icon font
            return (
                <span className="material-icons text-2xl text-gray-700 dark:text-gray-300">
                    {iconName}
                </span>
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Icons</DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search icon"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Icon Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto border rounded-md p-3">
                        <div className="grid grid-cols-8 gap-2">
                            {paginatedIcons.map((icon) => (
                                <button
                                    key={icon}
                                    onClick={() => setSelectedIcon(icon)}
                                    className={`
                                        flex items-center justify-center p-3 rounded-md
                                        hover:bg-gray-100 dark:hover:bg-gray-800
                                        transition-colors cursor-pointer
                                        ${selectedIcon === icon
                                            ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500"
                                            : "bg-gray-50 dark:bg-gray-900"
                                        }
                                    `}
                                    title={icon}
                                >
                                    {renderIcon(icon)}
                                </button>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}

                        {filteredIcons.length === 0 && (
                            <p className="text-center text-gray-500 py-8">
                                No icons found matching "{searchQuery}"
                            </p>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSelect}>
                        Select
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
