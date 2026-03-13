import { proxyApi } from "@/lib/api/api";
import type {
  GatewayListItem,
  GatewaysResponse,
} from "@/types/thingsboardGatewayTypes";

export interface CreateGatewayPayload {
  name: string;
  type: string;
  label: string;
  additionalInfo: { gateway: true };
}

export interface GatewayAttributeEntry {
  key: string;
  value: unknown;
  lastUpdateTs?: number;
}

export interface GatewayCredentials {
  id: { id: string };
  createdTime: number;
  deviceId: { entityType: string; id: string };
  credentialsType: "ACCESS_TOKEN" | "MQTT_BASIC" | "X509_CERTIFICATE";
  credentialsId: string | null;
  credentialsValue: string | null;
  version: number;
}

export interface GatewayConfigurationData {
  clientAttributes: GatewayAttributeEntry[];
  sharedAttributes: GatewayAttributeEntry[];
  credentials: GatewayCredentials | null;
}

export interface GatewayConnectorItem {
  name: string;
  status: "active" | "inactive";
  config: Record<string, unknown> | null;
}

export interface GatewayConnectorsData {
  activeConnectors: string[];
  inactiveConnectors: string[];
  version: string | null;
  connectors: GatewayConnectorItem[];
}

export interface AddGatewayConnectorPayload {
  name: string;
  type: string;
  logLevel?: string;
  useDefaults?: boolean;
  sendDataOnlyOnChange?: boolean;
}

export class GatewayService {
  public static async fetchGateways(
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
  ): Promise<GatewaysResponse> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortProperty,
      sortOrder,
    });

    const { data } = await proxyApi.get<GatewaysResponse>(
      `/thingsboard/gateways?${params.toString()}`,
    );

    return data;
  }

  public static async deleteGateway(id: string): Promise<void> {
    await proxyApi.delete(`/thingsboard/devices/${id}`);
  }

  public static async fetchGateway(id: string): Promise<GatewayListItem> {
    const { data } = await proxyApi.get<GatewayListItem>(
      `/thingsboard/devices/${id}`,
    );
    return data;
  }

  public static async createGateway(
    payload: CreateGatewayPayload,
  ): Promise<{ id: { id: string; entityType: string }; name: string }> {
    const { data } = await proxyApi.post<{
      id: { id: string; entityType: string };
      name: string;
    }>("/thingsboard/devices", payload);
    return data;
  }

  public static async fetchGatewayConfiguration(
    id: string,
  ): Promise<GatewayConfigurationData> {
    const { data } = await proxyApi.get<GatewayConfigurationData>(
      `/thingsboard/gateways/${id}/configuration`,
    );
    return data;
  }

  public static async saveGatewayCredentials(
    credentials: Partial<GatewayCredentials> & { credentialsType: string },
  ): Promise<void> {
    await proxyApi.post("/thingsboard/devices/credentials", credentials);
  }

  public static async saveGatewaySharedAttributes(
    id: string,
    attributes: Record<string, unknown>,
  ): Promise<void> {
    await proxyApi.put(`/thingsboard/devices/${id}/attributes`, attributes);
  }

  public static async downloadDockerCompose(id: string): Promise<void> {
    const response = await proxyApi.get(
      `/thingsboard/gateways/${id}/docker-compose`,
      { responseType: "blob" },
    );
    const url = URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "docker-compose.yml";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public static async fetchGatewayConnectors(
    id: string,
  ): Promise<GatewayConnectorsData> {
    const { data } = await proxyApi.get<GatewayConnectorsData>(
      `/thingsboard/gateways/${id}/connectors`,
    );
    return data;
  }

  public static async addGatewayConnector(
    id: string,
    payload: AddGatewayConnectorPayload,
  ): Promise<void> {
    await proxyApi.post(`/thingsboard/gateways/${id}/connectors`, payload);
  }
}
