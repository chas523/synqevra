"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select, { SelectOption } from "@/components/ui/select";

export type AttributeValueType =
  | "string"
  | "integer"
  | "double"
  | "boolean"
  | "json";

export interface AddAttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    key: string,
    value: unknown,
    valueType: AttributeValueType,
  ) => Promise<void>;
  title?: string;
}

const VALUE_TYPE_OPTIONS: SelectOption[] = [
  { value: "string", label: "String" },
  { value: "integer", label: "Integer" },
  { value: "double", label: "Double" },
  { value: "boolean", label: "Boolean" },
  { value: "json", label: "JSON" },
];

export function AddAttributeModal({
  isOpen,
  onClose,
  onAdd,
  title = "Add attribute",
}: AddAttributeModalProps) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [valueType, setValueType] = useState<AttributeValueType>("string");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setKey("");
    setValue("");
    setValueType("string");
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const parseValue = useCallback(
    (rawValue: string, type: AttributeValueType): unknown => {
      switch (type) {
        case "string":
          return rawValue;
        case "integer":
          const intVal = parseInt(rawValue, 10);
          if (isNaN(intVal)) throw new Error("Invalid integer");
          return intVal;
        case "double":
          const doubleVal = parseFloat(rawValue);
          if (isNaN(doubleVal)) throw new Error("Invalid number");
          return doubleVal;
        case "boolean":
          const lower = rawValue.toLowerCase();
          if (lower === "true" || lower === "1") return true;
          if (lower === "false" || lower === "0") return false;
          throw new Error("Invalid boolean (use true/false)");
        case "json":
          try {
            return JSON.parse(rawValue);
          } catch {
            throw new Error("Invalid JSON format");
          }
        default:
          return rawValue;
      }
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (!key.trim()) {
      setError("Attribute key is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const parsedValue = parseValue(value, valueType);
      await onAdd(key.trim(), parsedValue, valueType);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add attribute");
    } finally {
      setIsSubmitting(false);
    }
  }, [key, value, valueType, onAdd, handleClose, parseValue]);

  const getPlaceholder = useCallback((type: AttributeValueType): string => {
    switch (type) {
      case "string":
        return "String*";
      case "integer":
        return "e.g. 42";
      case "double":
        return "e.g. 3.14159";
      case "boolean":
        return "true or false";
      case "json":
        return '{"key": "value"}';
      default:
        return "";
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Key Input */}
          <div className="space-y-2">
            <Label
              htmlFor="attribute-key"
              className="text-slate-700 dark:text-slate-300"
            >
              Key*
            </Label>
            <Input
              id="attribute-key"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Attribute key"
              className={error && !key.trim() ? "border-red-500" : ""}
            />
            {error && !key.trim() && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Value Type Selector + Value Input */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Value</Label>
            <div className="flex gap-2">
              <Select
                options={VALUE_TYPE_OPTIONS}
                value={valueType}
                onValueChange={(val) => setValueType(val as AttributeValueType)}
                className="w-45"
              />

              <Input
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error && key.trim()) setError(null);
                }}
                placeholder={getPlaceholder(valueType)}
                className="flex-1"
              />
            </div>
            {error && key.trim() && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !key.trim()}
          >
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
