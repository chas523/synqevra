"use server"

import { cookies } from "next/headers";
import { EntityId } from "../../lib/utils";

export interface AssetProfile {
    id?: EntityId;
    name?: string;
    description?: string;
}

export interface AssetResponse {
    data: AssetProfile[];
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}

interface ErrorResponse {
    message?: string;
}

async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('session')?.value || null;
}

export const fetchAssets = async  () => {
    try {
        const token = await getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const baseUrl = process.env.BASE_URL;
        if (!baseUrl) throw new Error('BASE_URL environment variable is not set');

        const response = await fetch(`${baseUrl}/api/assetProfiles?pageSize=10&page=0`, {
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

        const data: AssetResponse = await response.json();
        console.log('Asset response:', JSON.stringify(data, null, 2));
        return { success: true, data };

    } catch (err) {
        console.error("Failed to fetch assets:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        return { success: false, error: errorMessage };
    }
}
