//import type { EntityId } from "@/lib/utils";

export interface EntityId {
  id?: string;
  entityType?: string;
}

export interface RuleNode {
  id: EntityId;
  createdTime: number;
  ruleChainId: EntityId;
  type: string;
  name: string;
  debugSettings: {
    failuresEnabled: boolean;
    allEnabled: boolean;
    allEnabledUntil: number;
  };
  singletonMode: boolean;
  queueName: string | null;
  configurationVersion: number;
  configuration: any;
  externalId: string | null;
  additionalInfo: {
    description: string | null;
    layoutX: number;
    layoutY: number;
  };
}

export interface RuleChainConnection {
  fromIndex: number;
  toIndex: number;
  type: string;
}

export interface RuleChainMetadata {
  ruleChainId: EntityId;
  version: number;
  firstNodeIndex: number | null;
  nodes: any[];
  connections: RuleChainConnection[];
  ruleChainConnections: any;
}

export interface RuleChainDetails {
  id: EntityId;
  name: string;
  type: string;
  debugMode: boolean;
  createdTime: number;
  additionalInfo?: any;
  firstRuleNodeId?: EntityId;
  root?: boolean;
}

export interface UpdateRuleChainRequest {
  name: string;
  debugMode: boolean;
  additionalInfo?: any;
  firstRuleNodeId?: EntityId;
}
export interface RuleChain {
  id?: EntityId;
  name?: string;
  type?: string;
  debugMode?: boolean;
  createdTime?: number;
  additionalInfo?: any;
}

export interface RuleChainResponse {
  data: RuleChain[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface CreateRuleChainRequest {
  name: string;
  type: string;
  debugMode: boolean;
}
