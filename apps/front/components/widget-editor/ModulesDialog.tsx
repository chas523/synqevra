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
import { ResourceService } from "@/lib/services/thingsboardServices/resourceService";
import { Resource } from "@/types/resourceTypes";
import { Plus, Trash2, Code, Info } from "lucide-react";
import { Combobox, useCombobox, TextInput } from "@mantine/core";

interface ModuleItem {
  alias: string;
  url: string;
}

interface ModulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: ModuleItem[];
  onChange: (modules: ModuleItem[]) => void;
}

export function ModulesDialog({
  open,
  onOpenChange,
  modules,
  onChange,
}: ModulesDialogProps) {
  const [localModules, setLocalModules] = useState<ModuleItem[]>([]);
  const [availableResources, setAvailableResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newModuleAlias, setNewModuleAlias] = useState("");
  const [newModuleUrl, setNewModuleUrl] = useState("");

  const combobox = useCombobox();

  useEffect(() => {
    if (open) {
      setLocalModules([...modules]);
      fetchResources();
    }
  }, [open, modules]);

  const fetchResources = async () => {
    try {
      const response = await ResourceService.getResources(
        0,
        50,
        "createdTime",
        "DESC",
        "JS_MODULE",
        "MODULE",
      );
      setAvailableResources(response.data);
    } catch (error) {
      console.error("Failed to fetch resources", error);
    }
  };

  const handleAddModule = () => {
    setLocalModules([...localModules, { alias: "", url: "" }]);
  };

  const handleRemoveModule = (index: number) => {
    const updated = localModules.filter((_, i) => i !== index);
    setLocalModules(updated);
  };

  const handleUpdateModule = (
    index: number,
    field: keyof ModuleItem,
    value: string,
  ) => {
    const updated = [...localModules];
    updated[index] = { ...updated[index], [field]: value };
    setLocalModules(updated);
  };

  const handleApply = () => {
    // Filter out empty entries if needed, or validate
    const validModules = localModules.filter((m) => m.alias && m.url);
    onChange(validModules);
    onOpenChange(false);
  };

  const filteredResources = availableResources.filter(
    (item) =>
      item.link?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Modules</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="grid grid-cols-[1fr_2fr_auto] gap-4 text-sm font-medium text-gray-500 mb-2 px-1">
            <div>Alias</div>
            <div>JS module resource</div>
            <div className="w-8"></div>
          </div>

          {localModules.length === 0 && (
            <div className="text-center py-8 text-gray-400 border rounded-md border-dashed">
              No modules configured
            </div>
          )}

          {localModules.map((module, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_2fr_auto] gap-4 items-start"
            >
              <Input
                value={module.alias}
                onChange={(e) =>
                  handleUpdateModule(index, "alias", e.target.value)
                }
                placeholder="Set"
                className={!module.alias ? "border-red-300" : ""}
              />
              <Combobox
                store={combobox}
                onOptionSubmit={(val) => {
                  handleUpdateModule(index, "url", val);
                  combobox.closeDropdown();
                }}
              >
                <Combobox.Target>
                  <TextInput
                    placeholder="Set"
                    value={module.url}
                    onChange={(event) => {
                      handleUpdateModule(
                        index,
                        "url",
                        event.currentTarget.value,
                      );
                      setSearchTerm(event.currentTarget.value);
                      combobox.openDropdown();
                    }}
                    onClick={() => {
                      setSearchTerm(module.url);
                      combobox.openDropdown();
                    }}
                    onFocus={() => {
                      setSearchTerm(module.url);
                      combobox.openDropdown();
                    }}
                    onBlur={() => combobox.closeDropdown()}
                    error={!module.url}
                  />
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Options
                    style={{ maxHeight: 200 }}
                    className="overflow-y-auto"
                  >
                    {filteredResources.length > 0 ? (
                      filteredResources.map((res) => (
                        <Combobox.Option
                          value={res.link || ""}
                          key={res.id?.id}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{res.title}</span>
                            <span className="text-xs text-gray-500">
                              {res.link}
                            </span>
                          </div>
                        </Combobox.Option>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-gray-500">
                        No JS modules found
                      </div>
                    )}
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>

              <div className="flex items-center gap-1 pt-2">
                <Info size={16} className="text-gray-400 cursor-help" />
                <Code size={16} className="text-gray-400 cursor-pointer" />
                <Trash2
                  size={16}
                  className="text-gray-400 hover:text-red-500 cursor-pointer"
                  onClick={() => handleRemoveModule(index)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button variant="outline" onClick={handleAddModule}>
            Add module
          </Button>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
