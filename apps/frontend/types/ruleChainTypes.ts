// ─── Rule Chain Node Types ─────────────────────────────────────────────────

export type RuleNodeCategory =
  | "Filter"
  | "Enrichment"
  | "Transformation"
  | "Action"
  | "Flow"
  | "External"
  | "Analytics";

export interface RuleNodeDefinition {
  /** Unique type identifier used in ThingsBoard */
  type: string;
  /** Display name shown in node library sidebar */
  label: string;
  /** Human-readable category for grouping */
  category: RuleNodeCategory;
  /** Short description surfaced in the sidebar */
  description: string;
  /** Tailwind background color class for the node chip */
  color: string;
  /** Icon name from lucide  */
  icon?: string;
}

// ─── React Flow Node Data ─────────────────────────────────────────────────

export interface RuleNodeData {
  label: string;
  nodeType: string;
  typeName: string;
  category: RuleNodeCategory;
  color: string;
  description?: string;
  /** Is this the immovable Input (start) node? */
  isInput?: boolean;
  /** ThingsBoard node configuration payload – set when user edits the node */
  configuration?: Record<string, unknown>;
}
