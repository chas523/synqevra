/**
 * WebSocket count entity type
 */

export type EntityType = "TENANT" | "DEVICE" | "USER";

/**
 * entity-count from backend
 */
export interface EntityCountData {
  type: EntityType;
  count: number;
}

/**
 * systemMetricsChart from backend
 */
export interface SystemMetricsData {
  time: string; // "11:05"
  cpu: number; // 2
  ram: number; // 48
  disk: number; // 8
}

/**
 * systemMetricsChart from backend
 */
export interface MsgCount {
  time?: string; // "yyyy-mm-dd"
  value: number; //234
}

/**
 * entity counts
 */
export interface EntityCounts {
  tenants: number;
  devices: number;
  users: number;
}

/**
 * latest (newest) values for system resource chart
 */
export interface LatestSystemMetrics {
  cpu: number;
  ram: number;
  disk: number;
  time?: string;
}
