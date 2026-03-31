"use client";

import { XIcon } from "lucide-react";
import {
  SelectAdmin,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";
import type { SelectOption, SelectProps } from "@/components/ui/select";

const PortalSelect = ({
  options,
  value,
  placeholder = "Select an option",
  onValueChange,
  className = "",
  disabled = false,
  allowClear = false,
  emptyMessage = "No options available",
  onOpenChange,
}: SelectProps) => {
  const hasValue = Boolean(value);

  return (
    <div className={`relative ${className}`}>
      <SelectAdmin
        value={value || undefined}
        onValueChange={onValueChange}
        disabled={disabled}
        onOpenChange={onOpenChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={placeholder}
            className="w-full justify-start text-left"
          />
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.description ? (
                  <div>
                    <div>{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                ) : (
                  option.label
                )}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </SelectAdmin>
      {allowClear && hasValue && !disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onValueChange("");
          }}
          className="absolute right-8 top-1/2 z-10 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Clear selected value"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default PortalSelect;
export type { SelectOption, SelectProps };
