"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDeviceCommunicationCount } from "@/hooks/thingsboard/dashboard/useDeviceCommunicationCount";
import { Clock } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  value: {
    label: "Communicates",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function DeviceCommunicationChart() {
  const { metricsHistory, isLoading } = useDeviceCommunicationCount();

  return (
    <>
      <CardHeader className="gap-0.5 px-2 py-1 flex-none">
        <div className="space-y-0">
          <h3 className="text-[10px] font-medium text-muted-foreground">
            Transport Messages
          </h3>
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            <span>History - Last 30 days</span>
          </div>
        </div>
      </CardHeader>
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : metricsHistory.length === 0 ? (
        <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
          No data
        </div>
      ) : (
        <CardContent className="pt-0 px-1 pb-1 flex-1 min-h-0">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={metricsHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 8 }} />
              <YAxis allowDecimals={false} domain={[0, "dataMax"]} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={(label) => `${label}`}
              />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      )}
    </>
  );
}
