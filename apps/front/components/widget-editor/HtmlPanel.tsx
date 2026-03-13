"use client";

import React, { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useWidgetEditor } from "@/context/WidgetEditorContext";
import { ResourceService } from "@/lib/services/thingsboardServices/resourceService";
import { Resource } from "@/types/resourceTypes";
import { Plus, X } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import {
  Combobox,
  useCombobox,
  TextInput,
  Checkbox,
  Button,
} from "@mantine/core";

export function HtmlPanel() {
  const { widgetType, updateDescriptor } = useWidgetEditor();
  const [activeTab, setActiveTab] = useState("resources");
  const { theme, resolvedTheme } = useTheme();

  // Debugging descriptor structure
  useEffect(() => {
    if (widgetType) {
      console.log("WidgetType Descriptor:", widgetType.descriptor);
    }
  }, [widgetType]);

  const onHtmlChange = (value: string | undefined) => {
    if (widgetType && widgetType.descriptor) {
      updateDescriptor({
        ...widgetType.descriptor,
        templateHtml: value || "",
      });
    }
  };

  const onCssChange = (value: string | undefined) => {
    if (widgetType && widgetType.descriptor) {
      updateDescriptor({
        ...widgetType.descriptor,
        templateCss: value || "",
      });
    }
  };

  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";

  return (
    <div className="w-full h-full bg-white dark:bg-slate-950 flex flex-col">
      <Tabs.Root
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        <Tabs.List className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900">
          <Tabs.Trigger
            value="resources"
            className={`px-4 py-2 text-sm font-medium outline-none ${
              activeTab === "resources"
                ? "text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-slate-950 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Resources
          </Tabs.Trigger>
          <Tabs.Trigger
            value="html"
            className={`px-4 py-2 text-sm font-medium outline-none ${
              activeTab === "html"
                ? "text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-slate-950 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            HTML
          </Tabs.Trigger>
          <Tabs.Trigger
            value="css"
            className={`px-4 py-2 text-sm font-medium outline-none ${
              activeTab === "css"
                ? "text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-slate-950 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            CSS
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="resources" className="flex-1 p-4 overflow-auto">
          <ResourcesTab />
        </Tabs.Content>

        <Tabs.Content value="html" className="flex-1 relative overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="html"
            value={widgetType?.descriptor?.templateHtml || ""}
            onChange={onHtmlChange}
            theme={editorTheme}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </Tabs.Content>

        <Tabs.Content value="css" className="flex-1 relative overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="css"
            value={widgetType?.descriptor?.templateCss || ""}
            onChange={onCssChange}
            theme={editorTheme}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function ResourcesTab() {
  const { widgetType, updateDescriptor } = useWidgetEditor();
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExtension, setIsExtension] = useState(false);
  const combobox = useCombobox();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await ResourceService.getResources(
          0,
          50,
          "createdTime",
          "DESC",
          "JS_MODULE",
          isExtension ? "EXTENSION" : undefined,
        );
        setResources(response.data);
      } catch (error) {
        console.error("Failed to fetch resources", error);
      }
    };

    fetchResources();
  }, [isExtension]);

  const existingResources = widgetType?.descriptor?.resources || [];

  const handleAddResource = (url: string, isExt: boolean) => {
    const newResources = [...existingResources, { url, isModule: !isExt }];
    if (widgetType && widgetType.descriptor) {
      updateDescriptor({
        ...widgetType.descriptor,
        resources: newResources,
      });
    }
    setSearchTerm("");
  };

  const removeResource = (index: number) => {
    const newResources = existingResources.filter(
      (_: any, i: number) => i !== index,
    );
    if (widgetType && widgetType.descriptor) {
      updateDescriptor({
        ...widgetType.descriptor,
        resources: newResources,
      });
    }
  };

  const filteredResources = resources.filter(
    (item) =>
      item.link?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const options = filteredResources.map((item) => (
    <Combobox.Option value={item.link || ""} key={item.id?.id}>
      <div className="flex flex-col">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {item.title}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {item.link}
        </span>
      </div>
    </Combobox.Option>
  ));

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Combobox
            store={combobox}
            onOptionSubmit={(val) => {
              setSearchTerm(val);
              combobox.closeDropdown();
            }}
          >
            <Combobox.Target>
              <TextInput
                label="JavaScript/CSS URL"
                placeholder="Search resources or enter URL"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.currentTarget.value);
                  combobox.openDropdown();
                }}
                onClick={() => combobox.openDropdown()}
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                rightSection={
                  searchTerm && (
                    <X
                      size={16}
                      className="cursor-pointer text-gray-400"
                      onClick={() => setSearchTerm("")}
                    />
                  )
                }
                classNames={{
                  label: "text-gray-700 dark:text-gray-300",
                  input:
                    "bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
                }}
              />
            </Combobox.Target>

            <Combobox.Dropdown className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
              <Combobox.Options className="overflow-y-auto">
                {options.length > 0 ? (
                  options
                ) : (
                  <Combobox.Empty className="text-gray-500 dark:text-gray-400">
                    No results found
                  </Combobox.Empty>
                )}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        </div>
        <Checkbox
          label="Is extension"
          checked={isExtension}
          onChange={(e) => setIsExtension(e.currentTarget.checked)}
          className="mb-2"
          classNames={{
            label: "text-gray-700 dark:text-gray-300",
            input: "dark:bg-slate-900 dark:border-gray-700",
          }}
        />
        <Button
          onClick={() => handleAddResource(searchTerm, isExtension)}
          disabled={!searchTerm}
          className="mb-px bg-blue-600 hover:bg-blue-700 text-white"
        >
          Add
        </Button>
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-4 py-2">URL</th>
              <th className="px-4 py-2 w-24">Type</th>
              <th className="px-4 py-2 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {existingResources.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-gray-400 dark:text-gray-500"
                >
                  No resources added
                </td>
              </tr>
            )}
            {existingResources.map((res: any, index: number) => (
              <tr
                key={index}
                className="hover:bg-gray-50 dark:hover:bg-slate-900 text-gray-900 dark:text-gray-100"
              >
                <td className="px-4 py-2 break-all">{res.url}</td>
                <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
                  {res.isModule ? "Module" : "Extension"}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => removeResource(index)}
                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
