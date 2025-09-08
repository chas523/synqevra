// Types for different node configurations
export interface JsFilterConfiguration {
  scriptLang: "JS";
  jsScript: string;
  tbelScript?: string | null;
}

export interface RestApiConfiguration {
  restEndpointUrlPattern: string;
  requestMethod: "GET" | "POST" | "PUT" | "DELETE";
  useSimpleClientHttpFactory: boolean;
  parseToPlainText: boolean;
  ignoreRequestBody: boolean;
  enableProxy?: boolean | null;
  useSystemProxyProperties?: boolean | null;
  proxyScheme?: string | null;
  proxyHost?: string | null;
  proxyPort?: number | null;
  proxyUser?: string | null;
  proxyPassword?: string | null;
  readTimeoutMs?: number | null;
  maxParallelRequestsCount?: number | null;
  headers: Record<string, string>;
  credentials: {
    type: "anonymous" | string;
  };
  maxInMemoryBufferSizeInKb: number;
}

export interface TransformConfiguration {
  scriptLang: "JS";
  jsScript: string;
  tbelScript: string;
}

export interface LogConfiguration {
  scriptLang: "JS";
  jsScript: string;
  tbelScript: string;
}

// Node type definitions
export interface NodeTemplate {
  type: string;
  name: string;
  displayName: string;
  description: string;
  defaultConfiguration:
    | JsFilterConfiguration
    | RestApiConfiguration
    | TransformConfiguration
    | LogConfiguration;
}

// Available node types
export const NODE_TYPES: NodeTemplate[] = [
  {
    type: "org.thingsboard.rule.engine.filter.TbJsFilterNode",
    name: "JS Filter",
    displayName: "JavaScript Filter",
    description: "Filter messages using JavaScript",
    defaultConfiguration: {
      scriptLang: "JS",
      jsScript: "return msg.temperature > 20;",
      tbelScript: null,
    },
  },
  {
    type: "org.thingsboard.rule.engine.rest.TbRestApiCallNode",
    name: "REST API Call",
    displayName: "REST API Call",
    description: "Make REST API calls",
    defaultConfiguration: {
      restEndpointUrlPattern: "https://api.example.com/endpoint",
      requestMethod: "POST",
      useSimpleClientHttpFactory: false,
      parseToPlainText: false,
      ignoreRequestBody: false,
      enableProxy: null,
      useSystemProxyProperties: null,
      proxyScheme: null,
      proxyHost: null,
      proxyPort: null,
      proxyUser: null,
      proxyPassword: null,
      readTimeoutMs: null,
      maxParallelRequestsCount: null,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: {
        type: "anonymous",
      },
      maxInMemoryBufferSizeInKb: 256,
    },
  },
  {
    type: "org.thingsboard.rule.engine.transform.TbTransformMsgNode",
    name: "Transform",
    displayName: "Transform Message",
    description: "Transform message using JavaScript",
    defaultConfiguration: {
      scriptLang: "JS",
      jsScript: "return {msg: msg, metadata: metadata, msgType: msgType};",
      tbelScript: "return {msg: msg, metadata: metadata, msgType: msgType};",
    },
  },
  {
    type: "org.thingsboard.rule.engine.action.TbLogNode",
    name: "Log",
    displayName: "Log Node",
    description: "Log messages",
    defaultConfiguration: {
      scriptLang: "JS",
      jsScript: "return 'Incoming message: ' + JSON.stringify(msg);",
      tbelScript: "return 'Incoming message: ' + JSON.stringify(msg);",
    },
  },
];

// Connection types
export const CONNECTION_TYPES = [
  "Success",
  "True",
  "False",
  "Failure",
] as const;
export type ConnectionType = (typeof CONNECTION_TYPES)[number];

// Flow chart node interface
export interface FlowNode {
  id: string; // temporary ID for UI, backend will generate real ID
  type: string;
  name: string;
  configuration: any;
  position: number; // position in the flow
}

// Connection interface - updated to handle multiple connections between same nodes
export interface FlowConnection {
  fromIndex: number;
  toIndex: number;
  type: ConnectionType;
}

// Helper function to get all connections between two nodes
export const getConnectionsBetweenNodes = (
  fromIndex: number,
  toIndex: number,
  connections: FlowConnection[]
): FlowConnection[] => {
  return connections.filter(
    (conn) => conn.fromIndex === fromIndex && conn.toIndex === toIndex
  );
};

// Helper function to add a connection type
export const addConnectionType = (
  fromIndex: number,
  toIndex: number,
  type: ConnectionType,
  connections: FlowConnection[]
): FlowConnection[] => {
  // Check if this exact connection already exists
  const exists = connections.some(
    (conn) =>
      conn.fromIndex === fromIndex &&
      conn.toIndex === toIndex &&
      conn.type === type
  );

  if (exists) return connections;

  return [...connections, { fromIndex, toIndex, type }];
};

// Helper function to remove a connection type
export const removeConnectionType = (
  fromIndex: number,
  toIndex: number,
  type: ConnectionType,
  connections: FlowConnection[]
): FlowConnection[] => {
  return connections.filter(
    (conn) =>
      !(
        conn.fromIndex === fromIndex &&
        conn.toIndex === toIndex &&
        conn.type === type
      )
  );
};
