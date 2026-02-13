"use client";

import { useState, useCallback } from "react";
import { SentNotificationsTable } from "@/components/organisms/SentNotificationsTable";
import { useNotificationRequests } from "@/hooks/dashboard/useNotificationRequests";
import type { NotificationRequest } from "@/lib/types/dashboardTypes";

const PAGE_SIZE = 10;

export default function SentNotificationsPage() {
    const [currentPage, setCurrentPage] = useState(0);
    const [sortProperty, setSortProperty] = useState("createdTime");
    const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

    const { requests, totalPages, totalElements, isLoading, mutate } = useNotificationRequests({
        page: currentPage,
        pageSize: PAGE_SIZE,
        sortProperty,
        sortOrder,
    });

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleSortChange = useCallback((property: string, order: "ASC" | "DESC") => {
        setSortProperty(property);
        setSortOrder(order);
        setCurrentPage(0);
    }, []);

    const handleRefresh = useCallback(() => {
        mutate();
    }, [mutate]);

    const handleRowClick = useCallback((request: NotificationRequest) => {
        // TODO: Open notification request details dialog
        console.log("Clicked notification request:", request);
    }, []);

    return (
        <div className="container mx-auto">
            <SentNotificationsTable
                requests={requests}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={PAGE_SIZE}
                sortProperty={sortProperty}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                onPageChange={handlePageChange}
                onRefresh={handleRefresh}
                onRowClick={handleRowClick}
            />
        </div>
    );
}
