import { ChevronDownIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  emptyMessage?: string;
  onOpenChange?: (open: boolean) => void;
}

const Select = ({
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
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        handleOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    const option = options.find((item) => item.value === optionValue);
    if (option?.disabled) {
      return;
    }
    onValueChange(optionValue);
    handleOpenChange(false);
  };

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onValueChange("");
    handleOpenChange(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && handleOpenChange(!isOpen)}
        disabled={disabled}
        className={`w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-between hover:bg-muted/50 ${allowClear && selectedOption ? "pr-16" : "pr-10"}`}
      >
        <span
          className={
            selectedOption ? "text-foreground" : "text-muted-foreground"
          }
        >
          {selectedOption?.label || placeholder}
        </span>
      </button>

      {allowClear && selectedOption && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-8 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Clear selected value"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      )}

      <ChevronDownIcon
        className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform ${
          isOpen ? "rotate-180" : ""
        }`}
      />

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                disabled={option.disabled}
                className={`w-full px-4 py-3 text-left transition-colors flex flex-col border-b border-border last:border-b-0 ${
                  option.disabled
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-muted"
                }`}
              >
                <span className="text-foreground text-sm font-medium">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
