"use client";

import { useState, useEffect } from "react";
import {
  EntityDetailPanel,
  type TabConfig,
} from "@/components/templates/EntityDetailPanel";
import { TenantDetailsForm } from "./config-forms/TenantDetailsForm";
import { OriginatorFieldsForm } from "./config-forms/OriginatorFieldsForm";
import { OriginatorAttributesForm } from "./config-forms/OriginatorAttributesForm";
import { ScriptForm } from "./config-forms/ScriptForm";
import { RestApiCallForm } from "./config-forms/RestApiCallForm";
import { RuleNodeEvents } from "./RuleNodeEvents";
import type {
  TenantDetailsConfig,
  OriginatorFieldsConfig,
  OriginatorAttributesConfig,
  ScriptConfig,
  RestApiCallConfig,
} from "@/types/ruleNodeConfig";
import type { RuleNodeData } from "@/types/ruleChainTypes";
import type { Node } from "@xyflow/react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Node type → TB class mapping ────────────────────────────────────────────
const TB_TENANT_DETAILS =
  "org.thingsboard.rule.engine.metadata.TbGetTenantDetailsNode";
const TB_ORIGINATOR_FIELDS =
  "org.thingsboard.rule.engine.metadata.TbGetOriginatorFieldsNode";
const TB_ORIGINATOR_ATTRS =
  "org.thingsboard.rule.engine.metadata.TbGetAttributesNode";
const TB_SCRIPT = "org.thingsboard.rule.engine.transform.TbTransformMsgNode";
const TB_REST_API = "org.thingsboard.rule.engine.rest.TbRestApiCallNode";

// ─── Default configs per node type ───────────────────────────────────────────
const defaults: Record<string, any> = {
  [TB_TENANT_DETAILS]: {
    detailsList: ["ID"],
    fetchTo: "DATA",
  } satisfies TenantDetailsConfig,

  [TB_ORIGINATOR_FIELDS]: {
    dataMapping: { name: "originatorName" },
    ignoreNullStrings: true,
    fetchTo: "METADATA",
  } satisfies OriginatorFieldsConfig,

  [TB_ORIGINATOR_ATTRS]: {
    tellFailureIfAbsent: true,
    fetchTo: "METADATA",
    clientAttributeNames: [],
    sharedAttributeNames: [],
    serverAttributeNames: [],
    latestTsKeyNames: [],
    getLatestValueWithTs: false,
  } satisfies OriginatorAttributesConfig,

  [TB_SCRIPT]: {
    scriptLang: "TBEL",
    jsScript: "return {msg: msg, metadata: metadata, msgType: msgType};",
    tbelScript: "return {msg: msg, metadata: metadata, msgType: msgType};",
  } satisfies ScriptConfig,

  [TB_REST_API]: {
    restEndpointUrlPattern: "",
    requestMethod: "POST",
    headers: { "Content-Type": "application/json" },
    useSimpleClientHttpFactory: false,
    parseToPlainText: false,
    ignoreRequestBody: false,
    enableProxy: false,
    useSystemProxyProperties: false,
    proxyScheme: "http",
    proxyPort: 0,
    readTimeoutMs: 0,
    maxParallelRequestsCount: 0,
    maxInMemoryBufferSizeInKb: 256,
    credentials: { type: "anonymous" },
  } satisfies RestApiCallConfig,
};

// ─── Configurable node types ──────────────────────────────────────────────────
const CONFIGURABLE_TYPES = Object.keys(defaults);

export function isConfigurableNode(nodeType: string): boolean {
  return CONFIGURABLE_TYPES.includes(nodeType);
}

// ─── Category / label helpers ─────────────────────────────────────────────────
const SUBTITLE_MAP: Record<string, string> = {
  [TB_TENANT_DETAILS]: "Enrichment - tenant details",
  [TB_ORIGINATOR_FIELDS]: "Enrichment - originator fields",
  [TB_ORIGINATOR_ATTRS]: "Enrichment - originator attributes",
  [TB_SCRIPT]: "Transformation - script",
  [TB_REST_API]: "External - REST API call",
};

interface NodeConfigPanelProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    nodeId: string,
    name: string,
    description: string,
    config: any,
  ) => void;
  tenantId?: string;
}

export function NodeConfigPanel({
  node,
  isOpen,
  onClose,
  onSave,
  tenantId,
}: NodeConfigPanelProps) {
  const nodeData = node?.data as unknown as RuleNodeData | undefined;
  const nodeType = nodeData?.nodeType ?? "";

  const [name, setName] = useState(nodeData?.label ?? "");
  const [description, setDescription] = useState(nodeData?.description ?? "");
  const [config, setConfig] = useState<any>(
    nodeData?.configuration ?? defaults[nodeType] ?? {},
  );

  // Reset forms when selected node changes
  useEffect(() => {
    if (node) {
      const d = node.data as unknown as RuleNodeData & { configuration?: any };
      setName(d.label ?? "");
      setDescription(d.description ?? "");
      setConfig(d.configuration ?? defaults[d.nodeType] ?? {});
    }
  }, [node?.id]);

  if (!node || !nodeData || !isConfigurableNode(nodeType)) {
    return null;
  }

  const handleSave = () => {
    onSave(node.id, name, description, config);
    onClose();
  };

  // ─── Build form content ─────────────────────────────────────────────────
  const formContent = (() => {
    switch (nodeType) {
      case TB_TENANT_DETAILS:
        return (
          <TenantDetailsForm
            key={node.id}
            name={name}
            description={description}
            config={config as TenantDetailsConfig}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onConfigChange={setConfig}
          />
        );
      case TB_ORIGINATOR_FIELDS:
        return (
          <OriginatorFieldsForm
            key={node.id}
            name={name}
            description={description}
            config={config as OriginatorFieldsConfig}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onConfigChange={setConfig}
          />
        );
      case TB_ORIGINATOR_ATTRS:
        return (
          <OriginatorAttributesForm
            key={node.id}
            name={name}
            description={description}
            config={config as OriginatorAttributesConfig}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onConfigChange={setConfig}
          />
        );
      case TB_SCRIPT:
        return (
          <ScriptForm
            key={node.id}
            name={name}
            description={description}
            config={config as ScriptConfig}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onConfigChange={setConfig}
          />
        );
      case TB_REST_API:
        return (
          <RestApiCallForm
            key={node.id}
            name={name}
            description={description}
            config={config as RestApiCallConfig}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onConfigChange={setConfig}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-32 text-muted-foreground dark:text-slate-500 text-sm">
            No configuration available for this node type.
          </div>
        );
    }
  })();

  const tabs: TabConfig[] = [
    {
      id: "details",
      label: "Details",
      content: formContent,
    },
    {
      id: "events",
      label: "Events",
      content:
        // Only fetch events if the node actually exists in the DB (usually a valid UUID)
        node.id.length > 20 ? (
          <RuleNodeEvents nodeId={node.id} tenantId={tenantId} />
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground dark:text-slate-500 text-sm">
            Please run or save the rule chain to view events.
          </div>
        ),
    },
  ];

  return (
    <EntityDetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={name || nodeData.label}
      subtitle={SUBTITLE_MAP[nodeType] ?? "Rule node configuration"}
      tabs={tabs}
      actionButtons={[
        {
          label: "Apply",
          onClick: handleSave,
          variant: "primary",
          icon: <Save className="h-4 w-4" />,
        },
        {
          label: "Discard",
          onClick: onClose,
          variant: "secondary",
          icon: <X className="h-4 w-4" />,
        },
      ]}
      className="sm:max-w-2xl"
    />
  );
}
