/**
 * Entity type configuration for version control operations (auto-commit, export, etc.)
 * This config maps entity types to their display names and available export options.
 * Reusable across auto-commit settings, version load, and other version control features.
 */

export interface EntityExportOption {
    key: string;
    label: string;
    defaultValue: boolean;
}

export interface EntityTypeConfig {
    value: string;
    label: string;
    pluralLabel: string;
    exportOptions: EntityExportOption[];
}

// Common export options used as building blocks
const EXPORT_ATTRIBUTES: EntityExportOption = { key: "saveAttributes", label: "Export attributes", defaultValue: true };
const EXPORT_RELATIONS: EntityExportOption = { key: "saveRelations", label: "Export relations", defaultValue: false };
const EXPORT_CREDENTIALS: EntityExportOption = { key: "saveCredentials", label: "Export credentials", defaultValue: true };
const EXPORT_CALCULATED_FIELDS: EntityExportOption = { key: "saveCalculatedFields", label: "Export calculated fields", defaultValue: true };

/**
 * All entity types supported in version control.
 * Each entry defines the API value, display labels, and which export checkboxes to show.
 */
export const ENTITY_TYPE_CONFIGS: EntityTypeConfig[] = [
    {
        value: "ASSET",
        label: "Asset",
        pluralLabel: "Assets",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS, EXPORT_CALCULATED_FIELDS],
    },
    {
        value: "DEVICE",
        label: "Device",
        pluralLabel: "Devices",
        exportOptions: [EXPORT_CREDENTIALS, EXPORT_ATTRIBUTES, EXPORT_RELATIONS, EXPORT_CALCULATED_FIELDS],
    },
    {
        value: "ENTITY_VIEW",
        label: "Entity View",
        pluralLabel: "Entity Views",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS],
    },
    {
        value: "DASHBOARD",
        label: "Dashboard",
        pluralLabel: "Dashboards",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS],
    },
    {
        value: "CUSTOMER",
        label: "Customer",
        pluralLabel: "Customers",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS],
    },
    {
        value: "DEVICE_PROFILE",
        label: "Device profile",
        pluralLabel: "Device profiles",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS, EXPORT_CALCULATED_FIELDS],
    },
    {
        value: "ASSET_PROFILE",
        label: "Asset profile",
        pluralLabel: "Asset profiles",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS, EXPORT_CALCULATED_FIELDS],
    },
    {
        value: "RULE_CHAIN",
        label: "Rule chain",
        pluralLabel: "Rule chains",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS],
    },
    {
        value: "WIDGET_TYPE",
        label: "Widget",
        pluralLabel: "Widgets",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS],
    },
    {
        value: "WIDGETS_BUNDLE",
        label: "Widgets bundle",
        pluralLabel: "Widgets bundles",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS],
    },
    {
        value: "TB_RESOURCE",
        label: "Resource",
        pluralLabel: "Resources",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS],
    },
    {
        value: "OTA_PACKAGE",
        label: "OTA package",
        pluralLabel: "OTA packages",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS],
    },
    {
        value: "NOTIFICATION_TEMPLATE",
        label: "Notification template",
        pluralLabel: "Notification templates",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS],
    },
    {
        value: "NOTIFICATION_TARGET",
        label: "Notification recipient",
        pluralLabel: "Notification recipients",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS],
    },
    {
        value: "NOTIFICATION_RULE",
        label: "Notification rule",
        pluralLabel: "Notification rules",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS],
    },
    {
        value: "AI_MODEL",
        label: "AI model",
        pluralLabel: "AI models",
        exportOptions: [EXPORT_ATTRIBUTES, EXPORT_RELATIONS],
    },
];

/**
 * Helper to get entity config by value (API key).
 */
export function getEntityTypeConfig(value: string): EntityTypeConfig | undefined {
    return ENTITY_TYPE_CONFIGS.find((e) => e.value === value);
}

/**
 * Builds the default export options object for a given entity type (to be used in auto-commit payload).
 */
export function buildDefaultExportOptions(entityTypeValue: string): Record<string, boolean> {
    const config = getEntityTypeConfig(entityTypeValue);
    if (!config) return {};
    const result: Record<string, boolean> = {};
    for (const opt of config.exportOptions) {
        result[opt.key] = opt.defaultValue;
    }
    return result;
}
