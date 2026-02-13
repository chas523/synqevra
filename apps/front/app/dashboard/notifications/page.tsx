"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function NotificationsPage() {
    useEffect(() => {
        // Redirect to inbox by default
        window.location.href = "/dashboard/notifications/inbox";
    }, []);

    return null;
}
