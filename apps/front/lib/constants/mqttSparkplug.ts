export const DEFAULT_SPARKPLUG_ATTRIBUTES_METRIC_NAMES = [
  "Node Control/*",
  "Device Control/*",
  "Properties/*",
] as const;

export const ensureSparkplugDefaultMetrics = (metrics: string[]) => {
  const defaultMetrics = [
    ...DEFAULT_SPARKPLUG_ATTRIBUTES_METRIC_NAMES,
  ] as string[];
  const normalized = metrics
    .map((metric) => metric.trim())
    .filter(Boolean)
    .filter(
      (metric, index, allMetrics) => allMetrics.indexOf(metric) === index,
    );

  return [
    ...defaultMetrics,
    ...normalized.filter((metric) => !defaultMetrics.includes(metric)),
  ];
};

export const isDefaultSparkplugMetric = (metric: string) =>
  DEFAULT_SPARKPLUG_ATTRIBUTES_METRIC_NAMES.includes(
    metric as (typeof DEFAULT_SPARKPLUG_ATTRIBUTES_METRIC_NAMES)[number],
  );
