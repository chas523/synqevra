"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, FileJson } from "lucide-react";
import { PropertyDialog, PropertyDefinition } from "./PropertyDialog";

interface SettingsSchemaTableProps {
  schemaJson: string | object;
  onChange: (newSchemaJson: string) => void;
}

export function SettingsSchemaTable({
  schemaJson,
  onChange,
}: SettingsSchemaTableProps) {
  const [properties, setProperties] = useState<PropertyDefinition[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<
    PropertyDefinition | undefined
  >(undefined);

  useEffect(() => {
    try {
      let parsed: any = schemaJson;
      if (typeof schemaJson === "string") {
        parsed = schemaJson ? JSON.parse(schemaJson) : {};
      }

      const props: PropertyDefinition[] = [];
      if (parsed && parsed.schema && parsed.schema.properties) {
        Object.keys(parsed.schema.properties).forEach((key) => {
          const prop = parsed.schema.properties[key];
          // Try to find order in form array if it exists, otherwise append
          // For now, simple iteration
          props.push({
            id: key,
            name: prop.title || key,
            type: prop.type,
            defaultValue: prop.default,
            required: (parsed.schema.required || []).includes(key),
            groupTitle: prop.groupTitle, // Custom field assumption
            hint: prop.description, // Custom field assumption or description
            // Extract other custom fields if stored in schema
            subLabel: prop["ui:options"]?.subLabel,
            verticalDivider: prop["ui:options"]?.verticalDivider,
            suffix: prop["ui:options"]?.suffix,
            disableOnProperty: prop["ui:options"]?.disableOnProperty,
            displayCondition: prop["ui:options"]?.displayCondition,
            rowClass: prop["ui:options"]?.rowClass,
            fieldClass: prop["ui:options"]?.fieldClass,
          });
        });
      }
      setProperties(props);
    } catch (e) {
      console.error("Failed to parse schema", e);
      setProperties([]);
    }
  }, [schemaJson]);

  const updateSchema = (newProps: PropertyDefinition[]) => {
    // Reconstruct schema object
    const schema = {
      type: "object",
      title: "Settings",
      properties: {} as any,
      required: [] as string[],
    };

    const form: string[] = []; // Simple form array

    newProps.forEach((p) => {
      schema.properties[p.id] = {
        title: p.name,
        type: p.type,
        default: p.defaultValue,
        description: p.hint,
        groupTitle: p.groupTitle,
        "ui:options": {
          subLabel: p.subLabel,
          verticalDivider: p.verticalDivider,
          suffix: p.suffix,
          disableOnProperty: p.disableOnProperty,
          displayCondition: p.displayCondition,
          rowClass: p.rowClass,
          fieldClass: p.fieldClass,
        },
      };
      if (p.required) {
        schema.required.push(p.id);
      }
      form.push(p.id);
    });

    const newJson = JSON.stringify({ schema, form }, null, 2);
    onChange(newJson);
  };

  const handleAdd = (prop: PropertyDefinition) => {
    const newProps = [...properties, prop];
    setProperties(newProps);
    updateSchema(newProps);
  };

  const handleEdit = (prop: PropertyDefinition) => {
    const newProps = properties.map((p) => (p.id === prop.id ? prop : p));
    setProperties(newProps);
    updateSchema(newProps);
  };

  const handleDelete = (id: string) => {
    const newProps = properties.filter((p) => p.id !== id);
    setProperties(newProps);
    updateSchema(newProps);
  };

  const openAddDialog = () => {
    setEditingProperty(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (prop: PropertyDefinition) => {
    setEditingProperty(prop);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-800 rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800 sticky top-0">
            <tr>
              <th className="px-4 py-2">Id</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2 w-24 text-center">
                <div title="Actions" className="mx-auto inline-block">
                  <FileJson size={16} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {properties.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-gray-400 dark:text-gray-500"
                >
                  No properties configured
                </td>
              </tr>
            )}
            {properties.map((prop) => (
              <tr
                key={prop.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-900 text-gray-900 dark:text-gray-100"
              >
                <td className="px-4 py-2">{prop.id}</td>
                <td className="px-4 py-2">{prop.name}</td>
                <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
                  {prop.type}
                </td>
                <td className="px-4 py-2 text-center flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEditDialog(prop)}
                    className="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(prop.id)}
                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-4">
        <Button
          onClick={openAddDialog}
          className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-900"
        >
          Add property
        </Button>
      </div>

      <PropertyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        property={editingProperty}
        onSave={editingProperty ? handleEdit : handleAdd}
        existingIds={properties.map((p) => p.id)}
      />
    </div>
  );
}
