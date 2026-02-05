"use client";

import {
    Bell,
    Calendar,
    Mail,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingCard, Pagination } from "../molecules";
import {
    EmptyState,
    ErrorState,
    FilterBar,
    ListHeader,
} from "@/components/organisms";
import type {
    PaginatedResponse,
    Notification,
    NotificationsRequestOptions,
} from "@/lib/types/dashboardTypes";
import { formatTenantDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NotificationsListPageProps {
    data: PaginatedResponse<Notification> | undefined;
    error: Error | undefined;
    isLoading: boolean;
    onRefresh: () => void;
    options: NotificationsRequestOptions;
    onSortChange: (value: string) => void;
    sortOptions: readonly { value: string; label: string }[];
    onNextPage: () => void;
    onPrevPage: () => void;
}

const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
        case "sent":
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case "failed":
            return <XCircle className="h-4 w-4 text-red-500" />;
        case "pending":
            return <Clock className="h-4 w-4 text-yellow-500" />;
        default:
            return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
};

const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
        case "sent":
            return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
        case "failed":
            return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
        case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
};

export function NotificationsListPage({
    data,
    error,
    isLoading,
    onRefresh,
    options,
    onSortChange,
    sortOptions,
    onNextPage,
    onPrevPage,
}: NotificationsListPageProps) {
    if (error) {
        return (
            <ErrorState
                title="Error Loading Notifications"
                message={error.message}
                onRetry={onRefresh}
                icon={<Bell className="h-5 w-5" />}
            />
        );
    }

    if (!data && !isLoading) {
        return (
            <EmptyState
                icon={<Bell className="h-12 w-12" />}
                title="No notifications available"
                description="No data found. Try refreshing the page."
            />
        );
    }

    if (isLoading && !data) {
        return (
            <Card className="w-full">
                <ListHeader
                    icon={<Bell className="h-5 w-5" />}
                    title="Notifications"
                    description="View all system notifications"
                    count={0}
                    isLoading={true}
                    onRefresh={onRefresh}
                />
                <CardContent className="space-y-4">
                    <LoadingCard count={5} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <ListHeader
                icon={<Bell className="h-5 w-5" />}
                title="Notifications"
                description="View all system notifications"
                count={data?.total || 0}
                isLoading={isLoading}
                onRefresh={onRefresh}
            />

            <CardContent className="space-y-4">
                <FilterBar
                    sortValue={`${options.sortBy}-${options.sortOrder}`}
                    onSortChange={onSortChange}
                    sortOptions={sortOptions}
                    showStatusFilter={false}
                />

                <div className="space-y-3">
                    {isLoading ? (
                        <LoadingCard count={5} />
                    ) : !data?.data || data.data.length === 0 ? (
                        <EmptyState
                            icon={<Bell className="h-12 w-12" />}
                            title="No notifications found"
                            description="Try adjusting your filters"
                        />
                    ) : (
                        data.data.map((notification) => (
                            <div
                                key={notification.id.id}
                                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:border-gray-700"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <Bell className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {notification.subject || "Notification"}
                                                </h3>
                                                {notification.status && (
                                                    <Badge
                                                        variant="outline"
                                                        className={getStatusColor(notification.status)}
                                                    >
                                                        <span className="flex items-center gap-1">
                                                            {getStatusIcon(notification.status)}
                                                            {notification.status}
                                                        </span>
                                                    </Badge>
                                                )}
                                            </div>

                                            {notification.text && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                                    {notification.text}
                                                </p>
                                            )}

                                            <div className="mt-2 space-y-1">
                                                {notification.deliveryMethod && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Mail className="h-4 w-4" />
                                                        <span className="capitalize">
                                                            {notification.deliveryMethod}
                                                        </span>
                                                    </div>
                                                )}

                                                {notification.type && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{notification.type}</span>
                                                    </div>
                                                )}

                                                {notification.createdTime && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatTenantDate(notification.createdTime)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <Pagination
                    hasNext={data?.pagination?.hasNext ?? false}
                    hasPrev={data?.pagination?.hasPrev ?? false}
                    currentCount={data?.data?.length ?? 0}
                    total={data?.total ?? 0}
                    isLoading={isLoading}
                    onNext={onNextPage}
                    onPrev={onPrevPage}
                />
            </CardContent>
        </Card>
    );
}
