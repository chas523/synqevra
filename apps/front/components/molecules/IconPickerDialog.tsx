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
    }, [searchQuery, icons]);

    const loadIcons = async () => {
        setIsLoading(true);
        try {
            // Fetch from ThingsBoard's material icons metadata
            const response = await fetch(
                "http://localhost:8088/assets/metadata/material-icons.json"
            );
            const data = await response.json();
            // The JSON contains an array of icon names
            setIcons(data);
            setFilteredIcons(data);
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
                            {filteredIcons.map((icon) => (
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
                                    <span className="material-icons text-2xl text-gray-700 dark:text-gray-300">
                                        {icon}
                                    </span>
                                </button>
                            ))}
                        </div>
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
