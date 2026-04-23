"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { isDefaultSparkplugMetric } from "@/lib/constants/mqttSparkplug";

type MqttSparkplugSectionProps = {
  checked: boolean;
  metrics: string[];
  disabled?: boolean;
  checkboxId: string;
  metricsInputId: string;
  onCheckedChangeAction: (checked: boolean) => void;
  onAddMetricAction: (metric: string) => void;
  onRemoveMetricAction: (metric: string) => void;
};

export function MqttSparkplugSection({
  checked,
  metrics,
  disabled = false,
  checkboxId,
  metricsInputId,
  onCheckedChangeAction,
  onAddMetricAction,
  onRemoveMetricAction,
}: MqttSparkplugSectionProps) {
  const [draftMetric, setDraftMetric] = useState("");

  const submitDraftMetric = () => {
    const metric = draftMetric.trim();
    if (!metric) {
      return;
    }

    onAddMetricAction(metric);
    setDraftMetric("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Checkbox
          id={checkboxId}
          checked={checked}
          onCheckedChange={(value) => onCheckedChangeAction(Boolean(value))}
          className="mt-1"
          disabled={disabled}
        />
        <div className="flex-1 space-y-1">
          <label htmlFor={checkboxId} className="text-sm">
            MQTT Sparkplug B Edge of Network (EoN) node.
          </label>
          <p className="text-xs text-muted-foreground">
            Allow connections from EoN nodes with Sparkplug B payload and topic
            format.
          </p>
        </div>
      </div>

      {checked && (
        <div className="space-y-2">
          <label htmlFor={metricsInputId} className="text-sm font-medium">
            SparkPlug metrics to store as attributes.
          </label>
          <div className="flex min-h-10.5 flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2">
            {metrics.map((metric) => {
              const isDefaultMetric = isDefaultSparkplugMetric(metric);

              return (
                <Badge
                  key={metric}
                  variant="secondary"
                  className="gap-1 pr-1 text-xs"
                >
                  {metric}
                  {!isDefaultMetric && !disabled && (
                    <button
                      type="button"
                      onClick={() => onRemoveMetricAction(metric)}
                      className="rounded-full p-0.5 hover:bg-muted"
                      aria-label={`Remove ${metric}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              );
            })}
            <Input
              id={metricsInputId}
              value={draftMetric}
              onChange={(event) => setDraftMetric(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  submitDraftMetric();
                }
              }}
              onBlur={submitDraftMetric}
              placeholder="SparkPlug metrics to store as attributes"
              className="h-auto min-w-40 flex-1 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
              disabled={disabled}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Names of SparkPlug metrics that will be stored as device attributes.
            All other metrics will be stored as device telemetry.
          </p>
        </div>
      )}
    </div>
  );
}
