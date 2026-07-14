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
    <div className="flex h-full w-full flex-col bg-background">
      <Tabs.Root
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        <Tabs.List className="flex border-b border-border bg-muted">
          <Tabs.Trigger
            value="settings-form"
            className={`px-4 py-2 text-sm font-medium outline-none ${
              activeTab === "settings-form"
                ? "border-b-2 border-primary bg-background text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Settings form
          </Tabs.Trigger>
          <Tabs.Trigger
            value="data-key-settings-form"
            className={`px-4 py-2 text-sm font-medium outline-none ${
              activeTab === "data-key-settings-form"
                ? "border-b-2 border-primary bg-background text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Data key settings form
          </Tabs.Trigger>
          <Tabs.Trigger
            value="widget-settings"
            className={`px-4 py-2 text-sm font-medium outline-none ${
              activeTab === "widget-settings"
                ? "border-b-2 border-primary bg-background text-primary"
                : "text-muted-foreground hover:text-foreground"
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
                  ? "border-b-2 border-primary bg-background text-primary"
                  : "text-muted-foreground hover:text-foreground"
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
