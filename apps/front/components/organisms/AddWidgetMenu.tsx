"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileJson, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddWidgetMenuProps {
    onCreate: () => void;
    onImport: () => void;
}

export const AddWidgetMenu = ({ onCreate, onImport }: AddWidgetMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <Button variant="ghost" size="sm" className="border rounded-lg" onClick={() => setIsOpen(!isOpen)}>
                <Plus className="mr-2 h-4 w-4" /> Add Widget Type
            </Button>

            {isOpen && (
                <div
                    className={cn(
                        "absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border",
                        "animate-in fade-in-0 zoom-in-95"
                    )}
                >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                            onClick={() => {
                                onCreate();
                                setIsOpen(false);
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-popover-foreground hover:bg-muted hover:text-accent-foreground"
                            role="menuitem"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create new widget type
                        </button>
                        <button
                            onClick={() => {
                                onImport();
                                setIsOpen(false);
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-popover-foreground hover:bg-muted hover:text-accent-foreground"
                            role="menuitem"
                        >
                            <FileJson className="mr-2 h-4 w-4" />
                            Import widget type
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
