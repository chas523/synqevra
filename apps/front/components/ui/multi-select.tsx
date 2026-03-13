"use client";

import { createPortal } from "react-dom";
import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Use useLayoutEffect to calculate position before paint to avoid flickering/jumping
  React.useLayoutEffect(() => {
    if (open && containerRef.current) {
      const updatePosition = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
          });
        }
      };

      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    } else {
      setPosition(null);
    }
  }, [open]);

  const handleSelect = (e: React.MouseEvent, optionValue: string) => {
    // Prevent default behavior to keep the dropdown open if needed,
    // but ensure click events propagate enough to trigger state changes.
    e.stopPropagation();

    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleOptionMouseDown = (e: React.MouseEvent, optionValue: string) => {
    // Prevent default to disable focus loss from the input/container
    e.preventDefault();
    e.stopPropagation();
    handleSelect(e, optionValue);
  };

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div
        className={cn(
          "flex min-h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          className,
        )}
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-1">
          {value.length === 0 && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {value.length > 0 && (
            <span className="text-foreground">
              {value.length === options.length
                ? "All selected"
                : selectedLabels.length > 2
                  ? `${selectedLabels.length} selected`
                  : selectedLabels.join(", ")}
            </span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      {open &&
        position &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
              pointerEvents: "auto",
            }}
            onMouseDown={(e) => {
              // Prevent focus stealing from the dialog
              e.preventDefault();
            }}
          >
            <div className="p-1">
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                      isSelected ? "bg-accent/50" : "",
                    )}
                    onMouseDown={(e) => handleOptionMouseDown(e, option.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    <span>{option.label}</span>
                  </div>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
