"use client";

import { useEffect, useState } from "react";
import { useTelemetryContext } from "@/lib/context/TelemetryContext";
import type { Notification } from "@/lib/types/telemetryTypes";

export function useNotifications() {
    const {
        socket,
        requestNotificationsCount,
        requestNotifications,
        markNotificationsAsRead,
    } = useTelemetryContext();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!socket) return;

        // Initial request for count
        requestNotificationsCount();

        const handleNotificationsCount = (data: { count: number }) => {
            setUnreadCount(data.count);
        };

        const handleNotifications = (data: {
            notifications: Notification[];
            count: number;
        }) => {
            setNotifications(data.notifications);
            setUnreadCount(data.count);
            setIsLoading(false);
        };

        socket.on("notifications-count", handleNotificationsCount);
        socket.on("notifications", handleNotifications);

        return () => {
            socket.off("notifications-count", handleNotificationsCount);
            socket.off("notifications", handleNotifications);
        };
    }, [socket, requestNotificationsCount]);

    const fetchNotifications = () => {
        setIsLoading(true);
        requestNotifications();
    };

    const markAsRead = (ids: string[]) => {
        markNotificationsAsRead(ids);
        // Optimistic update
        setUnreadCount((prev) => Math.max(0, prev - ids.length));
        // We might want to update local notification state too if we track 'read' status locally
        setNotifications((prev) =>
            prev.map((n) =>
                ids.includes(n.id.id) ? { ...n, status: 'READ' } : n
            )
        );
    };

    return {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
    };
}
