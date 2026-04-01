/**
 * Runtime types for rule-node configuration panels.
 * Each node type has its own configuration shape.
 */

// ─── Shared ───────────────────────────────────────────────────────────────────

export type FetchTo = "METADATA" | "DATA";

// ─── Tenant Details ───────────────────────────────────────────────────────────

/** Fields available to pull from the Tenant entity */
export type TenantDetailField =
  | "ID"
  | "TITLE"
  | "COUNTRY"
  | "CITY"
  | "STATE"
  | "ZIP"
  | "ADDRESS"
  | "ADDRESS2"
  | "PHONE"
  | "EMAIL"
  | "ADDITIONAL_INFO";

export interface TenantDetailsConfig {
  detailsList: TenantDetailField[];
  fetchTo: FetchTo;
}

// ─── Originator Fields ────────────────────────────────────────────────────────

export type OriginatorField =
  | "id"
  | "name"
  | "type"
  | "label"
  | "createdTime"
  | "additionalInfo"
  | "tenantId"
  | "customerId"
  | "ownerId"
  | "firstName"
  | "lastName"
  | "email"
  | "title"
  | "country"
  | "state"
  | "city"
  | "address"
  | "address2"
  | "zip"
  | "phone"
  | "profileName";

export interface DataMappingEntry {
  sourceField: OriginatorField;
  targetKey: string;
}

export interface OriginatorFieldsConfig {
  dataMapping: Record<string, string>; // { sourceField: targetKey }
  ignoreNullStrings: boolean;
  fetchTo: FetchTo;
}

// ─── Originator Attributes ────────────────────────────────────────────────────

export interface OriginatorAttributesConfig {
  tellFailureIfAbsent: boolean;
  fetchTo: FetchTo;
  clientAttributeNames: string[];
  sharedAttributeNames: string[];
  serverAttributeNames: string[];
  latestTsKeyNames: string[];
  getLatestValueWithTs: boolean;
}

// ─── Script (Transformation) ──────────────────────────────────────────────────

export type ScriptLang = "JS" | "TBEL";

export interface ScriptConfig {
  scriptLang: ScriptLang;
  jsScript: string;
  tbelScript: string;
}

// ─── REST API Call ────────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RestApiCallConfig {
  restEndpointUrlPattern: string;
  requestMethod: HttpMethod;
  headers: Record<string, string>;
  useSimpleClientHttpFactory: boolean;
  parseToPlainText: boolean;
  ignoreRequestBody: boolean;
  enableProxy: boolean;
  useSystemProxyProperties: boolean;
  proxyScheme?: string | null;
  proxyHost?: string | null;
  proxyPort?: number;
  proxyUser?: string | null;
  proxyPassword?: string | null;
  readTimeoutMs: number | string | null;
  maxParallelRequestsCount: number | string | null;
  maxInMemoryBufferSizeInKb: number;
  credentials: {
    type: "anonymous" | "basic" | "pem";
    username?: string;
    password?: string;
    cert?: string;
  };
}

// ─── Node configuration union ─────────────────────────────────────────────────

export type NodeConfiguration =
  | TenantDetailsConfig
  | OriginatorFieldsConfig
  | OriginatorAttributesConfig
  | ScriptConfig
  | RestApiCallConfig;
