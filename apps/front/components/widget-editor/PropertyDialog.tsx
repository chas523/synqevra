"use client";

import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  SelectAdmin as Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/admin_select";

export interface PropertyDefinition {
  id: string;
  name: string;
  hint?: string;
  groupTitle?: string;
  type: string;
  defaultValue?: string;
  required: boolean;
  // Advanced UI settings
  // Advanced UI settings
  subLabel?: string;
  verticalDivider?: boolean;
  suffix?: string;
  disableOnProperty?: string;
  displayCondition?: string;
  rowClass?: string;
  fieldClass?: string;
}

interface PropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: PropertyDefinition;
  onSave: (property: PropertyDefinition) => void;
  existingIds: string[];
}

const PROPERTY_TYPES = [
  { value: "string", label: "Text" },
  { value: "integer", label: "Number" },
  { value: "password", label: "Password" },
  { value: "textarea", label: "Text area" },
  { value: "boolean", label: "Switch" },
  { value: "select", label: "Select" },
  { value: "radio", label: "Radio buttons" },
  { value: "date", label: "Date/Time" },
  { value: "image", label: "Image" },
  { value: "javascript", label: "JavaScript" },
  { value: "json", label: "JSON" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "markdown", label: "Markdown" },
  { value: "color", label: "Color" },
  { value: "color-settings", label: "Color settings" },
  { value: "font", label: "Font" },
  { value: "units", label: "Units" },
  { value: "icon", label: "Icon" },
  { value: "fieldset", label: "Fieldset" },
  { value: "array", label: "Array" },
  { value: "html-section", label: "HTML section" },
];

export function PropertyDialog({
  open,
  onOpenChange,
  property,
  onSave,
  existingIds,
}: PropertyDialogProps) {
  const [formData, setFormData] = useState<PropertyDefinition>({
    id: "",
    name: "",
    type: "string",
    required: false,
  });

  useEffect(() => {
    if (open) {
      if (property) {
        setFormData({ ...property });
      } else {
        setFormData({
          id: "",
          name: "",
          type: "string",
          required: false,
          defaultValue: "",
        });
      }
    }
  }, [open, property]);

  const handleChange = (field: keyof PropertyDefinition, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.id || !formData.name) return;
    onSave(formData);
    onOpenChange(false);
  };

  const isIdTaken = !property && existingIds.includes(formData.id);
  const isValid = formData.id && formData.name; // ID validation handled inline or assumed user knows

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {property ? "Edit property" : "Add property"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Id</Label>
            <Input
              value={formData.id}
              onChange={(e) => handleChange("id", e.target.value)}
              placeholder="Set"
              // disabled={!!property} // User requested ID to be editable even after creation
              className={isIdTaken && !property ? "border-red-500" : ""}
            />
            {isIdTaken && !property && (
              <p className="text-xs text-red-500">ID already exists</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Set"
            />
          </div>

          <div className="space-y-2">
            <Label>Hint</Label>
            <Input
              value={formData.hint || ""}
              onChange={(e) => handleChange("hint", e.target.value)}
              placeholder="Set"
            />
          </div>

          <div className="space-y-2">
            <Label>Group title</Label>
            <Input
              value={formData.groupTitle || ""}
              onChange={(e) => handleChange("groupTitle", e.target.value)}
              placeholder="Set"
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(val) => handleChange("type", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Default value</Label>
            {formData.type === "boolean" ? (
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.defaultValue === "true"}
                  onCheckedChange={(checked) =>
                    handleChange("defaultValue", checked ? "true" : "false")
                  }
                />
                <span className="text-sm text-gray-500">
                  {formData.defaultValue === "true" ? "True" : "False"}
                </span>
              </div>
            ) : (
              <Input
                value={formData.defaultValue || ""}
                onChange={(e) => handleChange("defaultValue", e.target.value)}
                placeholder="Set"
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) => handleChange("required", checked)}
            />
            <Label htmlFor="required">Value required</Label>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="advanced">
              <AccordionTrigger className="text-sm font-medium">
                Advanced UI settings
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Sub label</Label>
                  <Input
                    value={formData.subLabel || ""}
                    onChange={(e) => handleChange("subLabel", e.target.value)}
                    placeholder="Set"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="verticalDivider"
                    checked={formData.verticalDivider || false}
                    onCheckedChange={(checked) =>
                      handleChange("verticalDivider", checked)
                    }
                  />
                  <Label htmlFor="verticalDivider">
                    Vertical divider after
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Input field suffix</Label>
                  <Input
                    value={formData.suffix || ""}
                    onChange={(e) => handleChange("suffix", e.target.value)}
                    placeholder="Set"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Disable on property</Label>
                  <Select
                    value={formData.disableOnProperty || "__none__"}
                    onValueChange={(val: string) =>
                      handleChange(
                        "disableOnProperty",
                        val === "__none__" ? "" : val,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Set" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {existingIds
                        .filter((id) => id !== formData.id)
                        .map((id) => (
                          <SelectItem key={id} value={id}>
                            {id}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Display condition function: f(property, model)</Label>
                  <div className="relative border rounded-md min-h-[100px] bg-gray-50 dark:bg-slate-900">
                    {/* Simple Monaco editor placeholder or actual editor if feasible. For now textarea */}
                    <textarea
                      className="w-full h-full min-h-[100px] p-2 bg-transparent outline-none text-sm font-mono"
                      value={formData.displayCondition || ""}
                      onChange={(e) =>
                        handleChange("displayCondition", e.target.value)
                      }
                      placeholder="// return true/false"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Property row classes</Label>
                  <Input
                    value={formData.rowClass || ""}
                    onChange={(e) => handleChange("rowClass", e.target.value)}
                    placeholder="Set"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Property field classes</Label>
                  <Input
                    value={formData.fieldClass || ""}
                    onChange={(e) => handleChange("fieldClass", e.target.value)}
                    placeholder="Set"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {property ? "Save" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
