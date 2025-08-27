"use server";

import { cookies } from "next/headers";

async function getAuthToken() {
    const cookieStore = await cookies();
    return cookieStore.get('session')?.value || null;
}

export async function fetchUsageData() {
    try {
        const token = await getAuthToken();

        if (!token) {
            throw new Error("Not authenticated");
        }

        const response = await fetch("https://demo.thingsboard.io/api/usage", {
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

            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error("Failed to fetch usage data:", error);
    }
}