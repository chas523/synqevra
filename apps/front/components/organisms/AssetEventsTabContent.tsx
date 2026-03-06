"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { TimeRangeFilter, TimeRange } from "@/components/molecules/TimeRangeFilter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface AssetEventsTabContentProps {
    assetId: string;
}

export function AssetEventsTabContent({ assetId }: AssetEventsTabContentProps) {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [eventType, setEventType] = useState<string>("");
    const [timeRange, setTimeRange] = useState<TimeRange>({ type: "ALL_TIME" });

    const { data, isLoading, mutate } = useSWR(
        assetId
            ? [
                "assetEvents",
                assetId,
                page,
                pageSize,
                eventType,
                timeRange.startTime,
                timeRange.endTime,
            ]
            : null,
        async () => {
            return AssetService.getAssetEvents(
                assetId,
                page,
                pageSize,
                eventType || undefined,
                timeRange.startTime,
                timeRange.endTime
            );
        }
    );

    const handlePageChange = useCallback((newPage: number) => setPage(newPage), []);

    const handleRefresh = useCallback(() => {
        mutate();
    }, [mutate]);

    const handleTimeRangeChange = useCallback((range: TimeRange) => {
        setTimeRange(range);
        setPage(0);
    }, []);

    const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEventType(e.target.value);
        setPage(0);
    };

    const columns: DataTableColumn<any>[] = useMemo(
        () => [
            {
                key: "createdTime",
                header: "Created time",
                render: (event) => new Date(event.createdTime).toLocaleString(),
            },
            {
                key: "type",
                header: "Type",
                render: (event) => event.body?.type || event.type || "-",
            },
            {
                key: "server",
                header: "Server",
                render: (event) => event.body?.server || "-",
            },
            {
                key: "entityId",
                header: "Entity ID",
                render: (event) => event.entityId?.id || "-",
            },
            {
                key: "data",
                header: "Event Data",
                render: (event) => (
                    <div className="max-w-75 truncate text-xs font-mono text-slate-500">
                        {JSON.stringify(event.body)}
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                    <Label htmlFor="eventType" className="whitespace-nowrap font-medium text-slate-700">
                        Event Type
                    </Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            id="eventType"
                            type="text"
                            placeholder="e.g. ERROR, STATS"
                            value={eventType}
                            onChange={handleTypeChange}
                            className="pl-9 h-9 w-50"
                        />
                    </div>
                </div>
                <TimeRangeFilter value={timeRange} onChange={handleTimeRangeChange} />
            </div>

            <DataTable
                title="Events"
                data={data?.data || []}
                columns={columns}
                getRowId={(row) => row.id.id}
                isLoading={isLoading}
                currentPage={page}
                pageSize={pageSize}
                totalPages={data?.totalPages || 0}
                totalElements={data?.totalElements || 0}
                onPageChange={handlePageChange}
                onRefresh={handleRefresh}
                emptyMessage="No events found for this asset."
                loadingMessage="Loading events..."
            />
        </div>
    );
}
