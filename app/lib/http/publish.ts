export async function publishHttp(
  host: string,
  port: string,
  key: string,
  payload: any,
) {
  console.log(`[${host}] ${port}: ${JSON.stringify(payload)}`);

  const url = `http://${host}:${port}/api/v1/${key}/telemetry`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `HTTP error! status: ${res.status}${text ? `, message: ${text}` : ""}`,
    );
  }

  if (res.status === 204 || res.status === 205) return null;

  // if not 204/205, try to parse response as JSON
  const raw = await res.text().catch(() => "");
  if (!raw || !raw.trim()) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
