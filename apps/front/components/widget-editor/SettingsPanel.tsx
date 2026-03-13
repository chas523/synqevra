"use client";

import React, { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useWidgetEditor } from "@/context/WidgetEditorContext";
import { SettingsSchemaTable } from "./SettingsSchemaTable";
import { WidgetSettingsForm } from "./WidgetSettingsForm";

export function SettingsPanel() {
  const { widgetType, updateDescriptor } = useWidgetEditor();
  const [activeTab, setActiveTab] = useState("settings-form");

  const onSettingsSchemaChange = (newSchema: string) => {
    if (widgetType && widgetType.descriptor) {
      updateDescriptor({
        ...widgetType.descriptor,
        settingsSchema: newSchema,
      });
    }
  };

  const onDataKeySettingsSchemaChange = (newSchema: string) => {
    if (widgetType && widgetType.descriptor) {
      updateDescriptor({
        ...widgetType.descriptor,
        dataKeySettingsSchema: newSchema,
      });
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-slate-950 flex flex-col">
      <Tabs.Root
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        <Tabs.List className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900">
          <Tabs.Trigger
            value="settings-form"
            className={`px-4 py-2 text-sm font-medium outline-none ${
              activeTab === "settings-form"
                ? "text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-slate-950 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Settings form
          </Tabs.Trigger>
          <Tabs.Trigger
            value="data-key-settings-form"
            className={`px-4 py-2 text-sm font-medium outline-none ${
              activeTab === "data-key-settings-form"
                ? "text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-slate-950 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Data key settings form
          </Tabs.Trigger>
          <Tabs.Trigger
            value="widget-settings"
            className={`px-4 py-2 text-sm font-medium outline-none ${
              activeTab === "widget-settings"
                ? "text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-slate-950 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Widget settings
          </Tabs.Trigger>
          {["timeseries", "TIMESERIES"].includes(
            widgetType?.descriptor?.type,
          ) && (
            <Tabs.Trigger
              value="latest-data-key-settings-form"
              className={`px-4 py-2 text-sm font-medium outline-none ${
                activeTab === "latest-data-key-settings-form"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-slate-950 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Latest data key settings form
            </Tabs.Trigger>
          )}
        </Tabs.List>

        <Tabs.Content
          value="settings-form"
          className="flex-1 p-4 overflow-auto"
        >
          <SettingsSchemaTable
            schemaJson={widgetType?.descriptor?.settingsSchema}
            onChange={onSettingsSchemaChange}
          />
        </Tabs.Content>

        <Tabs.Content
          value="data-key-settings-form"
          className="flex-1 p-4 overflow-auto"
        >
          <SettingsSchemaTable
            schemaJson={widgetType?.descriptor?.dataKeySettingsSchema}
            onChange={onDataKeySettingsSchemaChange}
          />
        </Tabs.Content>

        <Tabs.Content
          value="widget-settings"
          className="flex-1 p-4 overflow-auto"
        >
          <WidgetSettingsForm />
        </Tabs.Content>
        {["timeseries", "TIMESERIES"].includes(
          widgetType?.descriptor?.type,
        ) && (
          <Tabs.Content
            value="latest-data-key-settings-form"
            className="flex-1 p-4 overflow-auto"
          >
            <SettingsSchemaTable
              schemaJson={widgetType?.descriptor?.latestDataKeySettingsSchema}
              onChange={(newSchema) => {
                if (widgetType && widgetType.descriptor) {
                  updateDescriptor({
                    ...widgetType.descriptor,
                    latestDataKeySettingsSchema: newSchema,
                  });
                }
              }}
            />
          </Tabs.Content>
        )}
      </Tabs.Root>
    </div>
  );
}
