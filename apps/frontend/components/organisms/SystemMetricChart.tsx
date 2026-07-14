"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Clock } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { useSystemMetrics } from "@/hooks/thingsboard/dashboard/useSystemMetrics";

const chartConfig = {
  cpu: {
    label: "CPU (Processor)",
    color: "#3b82f6",
  },
  ram: {
    label: "Memory (RAM)",
    color: "#a855f7",
  },
  disk: {
    label: "Disk",
    color: "#10b981",
  },
} satisfies ChartConfig;

export function SystemChart() {
  const { metricsHistory, isLoading } = useSystemMetrics();

  return (
    <div className="min-h-0 h-full flex flex-col gap-0 py-1 px-1">
      <CardHeader className="gap-0.5 px-2 py-1 flex-none">
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
          <Clock className="h-2.5 w-2.5" />
          <span>Real-time - Last 1 hour</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-1 pb-1 flex-1 min-h-0">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : metricsHistory.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
            No data
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart data={metricsHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 8 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 8 }} width={30} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Area
                type="monotone"
                dataKey="disk"
                name="Disk"
                stroke="var(--color-disk)"
                fill="var(--color-disk)"
                fillOpacity={0.2}
                strokeWidth={2.5}
              />
              <Area
                type="monotone"
                dataKey="ram"
                name="Memory (RAM)"
                stroke="var(--color-ram)"
                fill="var(--color-ram)"
                fillOpacity={0.2}
                strokeWidth={2.5}
              />
              <Area
                type="monotone"
                dataKey="cpu"
                name="CPU (Processor)"
                stroke="var(--color-cpu)"
                fill="var(--color-cpu)"
                fillOpacity={0.2}
                strokeWidth={2.5}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </div>
  );
}
