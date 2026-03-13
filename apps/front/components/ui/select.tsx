import { ChevronDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const Select = ({
  options,
  value,
  placeholder = "Select an option",
  onValueChange,
  className = "",
  disabled = false,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-between hover:bg-muted/50"
      >
        <span
          className={
            selectedOption ? "text-foreground" : "text-muted-foreground"
          }
        >
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex flex-col border-b border-border last:border-b-0"
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
