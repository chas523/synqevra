import mqtt, { IClientOptions } from "mqtt";
export const runtime = "nodejs";

type Options = {
  topic?: string;
  qos?: 0 | 1 | 2;
  retain?: boolean;
  username?: string;
  password?: string;
  clientId?: string;
  protocol?: "mqtt" | "mqtts" | "ws" | "wss";
  connectTimeoutMs?: number;
};

export async function publishMqttOnce(
  host: string,
  port: string,
  payload: any,
  opts: Options = {},
) {
  console.log(`[${host}] ${port}: ${JSON.stringify(payload)}`);

  const {
    topic = "data/",
    qos = 1, // QoS 1 żeby mieć PUBACK zanim zamkniemy połączenie
    retain = false,
    username,
    password,
    clientId,
    protocol = "mqtt",
    connectTimeoutMs = 5000,
  } = opts;

  const options: IClientOptions = {
    username,
    password,
    clientId,
    keepalive: 60,
    reconnectPeriod: 0, // nie próbuj sam re-connect po end()
    connectTimeout: connectTimeoutMs,
    // protocolVersion: 4 // (MQTT 3.1.1) — domyślne w mqtt.js
  };

  const url = `${protocol}://${host}:${port}`;

  return new Promise<{ rc: 0 }>((resolve, reject) => {
    const client = mqtt.connect(url, options);

    let settled = false;
    const settle = (err?: unknown) => {
      if (settled) return;
      settled = true;
      // NIE używamy force=true — pozwalamy dokończyć wysyłkę
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
        // przy QoS 1 callback wywoła się po PUBACK — dopiero teraz zamykamy
        settle();
      });
    };

    const onError = (err: unknown) => {
      settle(err);
    };

    client.once("connect", onConnect);
    client.once("error", onError);

    // Awaryjny timeout na brak połączenia
    const t = setTimeout(() => {
      settle(new Error("MQTT connect timeout"));
    }, connectTimeoutMs);

    client.once("connect", () => clearTimeout(t));
    client.once("error", () => clearTimeout(t));
  });
}
