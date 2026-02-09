"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

export interface DetailPanelSectionProps {
    title: string;
    children: ReactNode;
    collapsible?: boolean;
    defaultExpanded?: boolean;
    className?: string;
}

export function DetailPanelSection({
    title,
    children,
    collapsible = false,
    defaultExpanded = true,
    className,
}: DetailPanelSectionProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div
            className={cn(
                "border-b border-slate-200 dark:border-slate-700/50 py-4 last:border-b-0",
                className
            )}
        >
            {collapsible ? (
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full text-left group"
                >
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {title}
                    </h3>
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 text-slate-400 transition-transform duration-200",
                            isExpanded && "rotate-180"
                        )}
                    />
                </button>
            ) : (
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    {title}
                </h3>
            )}
            {(!collapsible || isExpanded) && (
                <div className={cn("space-y-3", collapsible && "mt-3")}>{children}</div>
            )}
        </div>
    );
}
