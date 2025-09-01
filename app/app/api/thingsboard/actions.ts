"use server";

import {
  ThingsboardCredentials,
  Asset,
  Device,
  DeviceProfile,
  EntityRelation,
} from "@/lib/thingsboard/types";

function ensureCorrectUrl(url: string): string {
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `http://${url}`;
}

function formatTimestamp(): string {
  // 2025-08-29T12:34:56.789Z -> 2025-08-29 12:34:56
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

/**
 * Log in to ThingsBoard and return auth token
 */
async function login(credentials: ThingsboardCredentials): Promise<string> {
  const { url, username, password } = credentials;
  const baseUrl = ensureCorrectUrl(url);
  console.log("           sadsd ");
  console.log(credentials);
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `[${new Date().toISOString()}] Login failed: ${response.status} ${response.statusText}`,
        errorData,
      );
      throw new Error(
        `Login failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    const token = data.token;

    console.log(`[${new Date().toISOString()}] Login successful`);
    return token;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Login error:`, error);
    throw error;
  }
}

/**
 * Create an asset in ThingsBoard
 */
export async function createAsset(formData: FormData): Promise<Asset | null> {
  const url = formData.get("url") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const assetName = formData.get("assetName") as string;

  if (!url || !username || !password || !assetName) {
    throw new Error("Missing required fields");
  }

  const baseUrl = ensureCorrectUrl(url);

  try {
    // Login to get token
    const token: string = await login({ url, username, password });

    // Get default asset profile
    console.log(`[${new Date().toISOString()}] Getting default asset profile`);
    const profileResponse = await fetch(
      `${baseUrl}/api/assetProfileInfo/default`,
      {
        headers: {
          "X-Authorization": `Bearer ${token}`,
        },
      },
    );

    if (!profileResponse.ok) {
      throw new Error(
        `Failed to get default asset profile: ${profileResponse.status}`,
      );
    }
    const profileData = await profileResponse.json();
    const defaultAssetProfileId = profileData.id;

    // Create the asset
    const capitalizedName =
      assetName.charAt(0).toUpperCase() + assetName.slice(1).toLowerCase();
    const assetData: Asset = {
      name: capitalizedName,
      label: capitalizedName,
      asset_profile_id: defaultAssetProfileId,
    };

    console.log(
      `[${new Date().toISOString()}] Creating asset: ${capitalizedName}`,
    );
    const response = await fetch(`${baseUrl}/api/asset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(assetData),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to create asset: ${response.status}`);
    }

    const asset = await response.json();
    console.log(`[${new Date().toISOString()}] Asset was created:`, asset);

    return asset;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating asset:`, error);
    throw error;
  }
}

/**
 * Create a device in ThingsBoard
 */
export async function createDevice(formData: FormData): Promise<string[]> {
  const url = formData.get("url") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const deviceName = formData.get("deviceName") as string;
  const deviceType = formData.get("deviceType") as string;
  const assetId = formData.get("assetId") as string;

  if (!url || !username || !password || !deviceName) {
    throw new Error("Missing required fields");
  }

  const messages: string[] = [];
  const baseUrl = ensureCorrectUrl(url);

  try {
    // Login first to get token
    const token = await login({ url, username, password });
    const selectedType = deviceType.toUpperCase();
    let deviceProfileId: string;

    if (selectedType !== "DEFAULT") {
      // Create custom device profile
      const deviceProfileData: DeviceProfile = {
        name: deviceName,
        type: selectedType, // "LWM2M" | "SNMP"
        transport_type: selectedType, // dopasowany do type
        profile_data: {
          configuration: { type: "DEFAULT" },
          transport_configuration: { type: selectedType },
        },
      };

      const profileResponse = await fetch(`${baseUrl}/api/deviceProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(deviceProfileData),
        cache: "no-store",
      });
      if (!profileResponse.ok) {
        throw new Error(
          `Failed to create device profile: ${profileResponse.status}`,
        );
      }
      const created = await profileResponse.json();
      deviceProfileId = created?.id?.id ?? created?.id;
    } else {
      // Default profile
      const profileResponse = await fetch(
        `${baseUrl}/api/deviceProfileInfo/default`,
        {
          headers: { "X-Authorization": `Bearer ${token}` },
          cache: "no-store",
        },
      );
      if (!profileResponse.ok) {
        throw new Error(
          `Failed to get default device profile: ${profileResponse.status}`,
        );
      }
      const info = await profileResponse.json();
      deviceProfileId = info?.id?.id ?? info?.id; // w zależności od kształtu odpowiedzi
    }

    // Create the device
    const deviceData: Device = {
      name: deviceName,
      label: deviceName,
      device_profile_id: deviceProfileId,
    };

    console.log(`[${new Date().toISOString()}] Creating device: ${deviceName}`);

    const deviceResponse = await fetch(`${baseUrl}/api/device`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(deviceData),
      cache: "no-store",
    });

    if (!deviceResponse.ok) {
      throw new Error(`Failed to create device: ${deviceResponse.status}`);
    }

    const device = await deviceResponse.json();

    const timestamp = formatTimestamp();
    const message = `${timestamp} - INFO - Device was created: ${JSON.stringify(device)}`;
    messages.push(message);
    console.log(`[${new Date().toISOString()}] Device was created:`, device);

    // Create relation if asset ID is provided
    if (assetId) {
      console.log(`[${new Date().toISOString()}] Getting asset: ${assetId}`);

      const assetResponse = await fetch(`${baseUrl}/api/asset/${assetId}`, {
        headers: {
          "X-Authorization": `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!assetResponse.ok) {
        throw new Error(`Failed to get asset: ${assetResponse.status}`);
      }

      const asset = await assetResponse.json();

      const relation: EntityRelation = {
        from: asset.id,
        to: device.id,
        type: "Contains",
      };

      console.log(`[${new Date().toISOString()}] Creating relation`);

      const relationResponse = await fetch(`${baseUrl}/api/relation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(relation),
        cache: "no-store",
      });

      if (!relationResponse.ok) {
        throw new Error(
          `Failed to create relation: ${relationResponse.status}`,
        );
      }

      const relationTimestamp = formatTimestamp();
      const relationMessage = `${relationTimestamp} - INFO - Relation was created: ${JSON.stringify(relation)}`;
      messages.push(relationMessage);
      console.log(
        `[${new Date().toISOString()}] Relation was created:`,
        relation,
      );
    }

    return messages;
  } catch (error) {
    throw error;
  }
}
