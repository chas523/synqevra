"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxItem {
  value: string;
  label: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Combobox({
  items,
  value,
  onValueChange,
  placeholder = "Select item...",
  className,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItem = items.find((item) => item.value === value);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: ComboboxItem | null) => {
    onValueChange(item ? item.value : "");
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          className={selectedItem ? "text-foreground" : "text-muted-foreground"}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <div className="flex items-center border-b px-3 pb-2 mb-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-8 w-full rounded-md bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-[200px] overflow-y-auto">
            <div
              onClick={() => handleSelect(null)}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                value === "" ? "bg-accent text-accent-foreground" : ""
              )}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === "" ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="text-muted-foreground">No selection</span>
            </div>
            {filteredItems.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No items found.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.value}
                  onClick={() => handleSelect(item)}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
