"use server";

import { cookies } from "next/headers";

interface UsageData {
    [key: string]: any;
}

interface ErrorResponse {
    message?: string;
}

interface FetchResult {
    success: boolean;
    data?: UsageData;
    error?: string;
}


async function getAuthToken() {
    const cookieStore = await cookies();
    return cookieStore.get('session')?.value || null;
}

export async function fetchUsageData(): Promise<FetchResult> {
    try {
        const token = await getAuthToken();

        if (!token) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(`${process.env.BASE_URL}/api/usage`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            next: { revalidate: 30 }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Authentication failed. Please login again.");
            }

            let errorData: ErrorResponse;
            try {
                errorData = await response.json() as ErrorResponse;
            } catch {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: UsageData = await response.json();
        return { success: true, data };

    } catch (err) {
        console.error("Failed to fetch usage data:", err);
    }
}
