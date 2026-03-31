"use client";

import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface Lwm2mObjectOption {
  keyId: string;
  name: string;
}

interface Lwm2mObjectListFieldProps {
  options: Lwm2mObjectOption[];
  selected: Lwm2mObjectOption[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAdd: (option: Lwm2mObjectOption) => void;
  onRemove: (keyId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function Lwm2mObjectListField({
  options,
  selected,
  searchValue,
  onSearchChange,
  onAdd,
  onRemove,
  isLoading = false,
  disabled = false,
}: Lwm2mObjectListFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const selectedIds = useMemo(
    () => new Set(selected.map((item) => item.keyId)),
    [selected],
  );

  const availableOptions = useMemo(
    () => options.filter((item) => !selectedIds.has(item.keyId)),
    [options, selectedIds],
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (
        containerRef.current?.contains(event.target as Node) ||
        dropdownRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen || !containerRef.current) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, selected.length, options.length, searchValue]);

  const handleContainerClick = () => {
    if (disabled) {
      return;
    }
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleSelect = (option: Lwm2mObjectOption) => {
    onAdd(option);
    onSearchChange("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <div
        className={cn(
          "min-h-10 rounded-md border border-input bg-background px-2 py-2",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-text",
        )}
        onClick={handleContainerClick}
      >
        <div className="flex flex-wrap items-center gap-2">
          {selected.map((item) => (
            <span
              key={item.keyId}
              className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
            >
              <span>{`${item.name} #${item.keyId}`}</span>
              {!disabled && (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove(item.keyId);
                    setIsOpen(false);
                  }}
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </span>
          ))}

          <div className="flex min-w-45 flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(event) => {
                onSearchChange(event.target.value);
                if (!isOpen) {
                  setIsOpen(true);
                }
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={
                selected.length === 0 ? "Search object list" : "Search"
              }
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {isClient &&
        isOpen &&
        position &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-1000 max-h-72 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-lg"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
          >
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : availableOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No matching objects
              </div>
            ) : (
              <div className="p-1">
                {availableOptions.map((option) => (
                  <button
                    key={option.keyId}
                    type="button"
                    className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleSelect(option)}
                  >
                    <div className="font-medium">{`${option.keyId}: ${option.name}`}</div>
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
