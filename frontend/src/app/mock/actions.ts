"use server"

import {cookies} from "next/headers";
import mqtt, {IClientOptions} from "mqtt";
import {redirect} from "next/navigation";

interface ErrorResponse {
    message?: string;
}

export interface Device{
    id: { id: string; entityType: string };
    tenantId?: { id: string; entityType: string };
    name: string;
}

interface DevicesResponse {
    data: Device[];
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}

interface DeviceKey {
    credentialsId: string;
    credentialsType: string;
}

async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("session")?.value || null;
}

export const fetchDevices = async (page: number = 0, pageSize: number = 10) => {
    try {
        const token = await getAuthToken()
        if (!token) throw new Error('Not authenticated');

        const baseUrl = process.env.BASE_URL;
        if (!baseUrl) {
            throw new Error("BASE_URL environment variable is not set");
        }
        const response = await fetch(`${baseUrl}/api/tenant/deviceInfos?pageSize=${pageSize}&page=${page}&sortProperty=createdTime&sortOrder=DESC`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            if (response.status === 401) throw new Error("Authentication failed. Please login again.");

            const errorData: ErrorResponse = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data: DevicesResponse = await response.json();
        return { success: true, data };
    } catch (err) {
        console.error("Failed to fetch devices:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        return { success: false, error: errorMessage };
    }
}

const getDeviceToken = async (deviceId: string) => {
    try {
        const token = await getAuthToken()
        if (!token) throw new Error('Not authenticated');

        const baseUrl = process.env.BASE_URL;
        if (!baseUrl) {
            throw new Error("BASE_URL environment variable is not set");
        }
        const response = await fetch(`${baseUrl}/api/device/${deviceId}/credentials`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            if (response.status === 401) throw new Error("Authentication failed. Please login again.");

            const errorData: ErrorResponse = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: DeviceKey = await response.json();
        return { success: true, data };
    }catch (err) {
        console.error("Failed to fetch devices:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        return { success: false, error: errorMessage };
    }
}

const publishHttp = async (deviceKey: string, payload: any) => {
    try {
        const baseUrl: string = process.env.BASE_URL;
        if (!baseUrl) {
            throw new Error("BASE_URL environment variable is not set");
        }

        const response = await fetch(`${baseUrl}/api/v1/${deviceKey}/telemetry`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData: ErrorResponse = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return { success: true };
    }catch (err) {
        console.error("Failed to fetch devices:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        return { success: false, error: errorMessage };
    }
}

const DEFAULTS = {
    brokerUrl: process.env.MQTT_BROKER_URL,
    topic: "data/",
    qos: 1 as 0 | 1 | 2,
    retain: false,
    keepalive: 60,
    connectTimeoutMs: 5000,
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
    clientId: process.env.MQTT_CLIENT_ID || undefined,
};

export const publishMqtt = async (payload: any): Promise<{ rc: 0 }> => {
    const {
        brokerUrl,
        topic,
        qos,
        retain,
        keepalive,
        connectTimeoutMs,
        username,
        password,
        clientId,
    } = DEFAULTS;

    if (!brokerUrl) throw new Error("MQTT broker URL is not defined (MQTT_BROKER_URL).");

    const options: IClientOptions = {
        keepalive,
        reconnectPeriod: 0,
        connectTimeout: connectTimeoutMs,
        ...(username && { username }),
        ...(password && { password }),
        ...(clientId && { clientId }),
    };

    return new Promise<{ rc: 0 }>((resolve, reject) => {
        const client = mqtt.connect(brokerUrl, options);

        let settled = false;
        const settle = (err?: unknown) => {
            if (settled) return;
            settled = true;
            client.end(false, {}, () => {
                if (err) reject(err);
                else resolve({ rc: 0 });
            });
        };

        const onConnect = () => {
            const message =
                typeof payload === "string" ? payload : JSON.stringify(payload);
            client.publish(topic, message, { qos, retain }, (err) => {
                if (err) return settle(err);
                settle();
            });
        };

        const onError = (err: unknown) => {
            settle(err);
        };

        client.once("connect", onConnect);
        client.once("error", onError);

        // Handle no connection
        const t = setTimeout(() => {
            settle(new Error("MQTT connect timeout"));
        }, connectTimeoutMs);

        client.once("connect", () => clearTimeout(t));
        client.once("error", () => clearTimeout(t));
    });
}


export async function submitPost(formData: FormData): Promise<void> {

    try {
        const key = String(formData.get("device"));

        const token = await getDeviceToken(key)
        if (!token.success) {
            throw new Error(token.error || "Failed to get device token");
        }

        const valueList = formData.getAll("value[]").map((v) => String(v));
        const dataList = formData.getAll("data[]").map((v) => String(v));
        const message = Object.fromEntries(
            dataList.map((d, i) => [d.toLowerCase(), String(valueList[i] ?? "")]),
        );

        const data = await publishHttp(token.data.credentialsId, message);
        if (!data.success) {
            throw new Error(data.error || "Failed to publish data");
        }

    } catch (error) {
        console.error("Failed to fetch devices:", error);
    }
}