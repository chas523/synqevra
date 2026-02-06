"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Queue } from "@/types/queueTypes";
import {
    MoreHorizontal,
    Plus,
    RefreshCw,
    Search,
    Trash2,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface QueuesTableProps {
    queues: Queue[];
    isLoading: boolean;
    onRefresh: () => void;
    onAdd: () => void;
    onEdit: (queue: Queue) => void;
    onDelete: (queueId: string) => void;
}

export const QueuesTable = ({
    queues,
    isLoading,
    onRefresh,
    onAdd,
    onEdit,
    onDelete,
}: QueuesTableProps) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(
                queues
                    ? queues
                        .map((q) => q.id?.id)
                        .filter((id): id is string => !!id)
                    : []
            );
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter((sid) => sid !== id));
        }
    };

    const getStrategyLabel = (type: string) => {
        // Very basic formatting
        return type.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
    };


    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-bold">Queues</CardTitle>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={onAdd}>
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>

                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={
                                            queues?.length > 0 && selectedIds.length === queues.length
                                        }
                                        onCheckedChange={(checked) =>
                                            handleSelectAll(checked as boolean)
                                        }
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Partitions</TableHead>
                                <TableHead>Submit strategy</TableHead>
                                <TableHead>Processing strategy</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && queues.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Loading queues...
                                    </TableCell>
                                </TableRow>
                            ) : queues.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No queues found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                queues.map((queue) => (
                                    <TableRow
                                        key={queue.id?.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => onEdit(queue)}
                                    >
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedIds.includes(queue.id?.id || "")}
                                                onCheckedChange={(checked) =>
                                                    handleSelectOne(queue.id?.id || "", checked as boolean)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{queue.name}</TableCell>
                                        <TableCell>{queue.partitions}</TableCell>
                                        <TableCell>{getStrategyLabel(queue.submitStrategy.type)}</TableCell>
                                        <TableCell>{getStrategyLabel(queue.processingStrategy.type)}</TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => queue.id?.id && onDelete(queue.id.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
