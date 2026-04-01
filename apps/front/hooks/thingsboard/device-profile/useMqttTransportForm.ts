import {
  DEFAULT_SPARKPLUG_ATTRIBUTES_METRIC_NAMES,
  ensureSparkplugDefaultMetrics,
  isDefaultSparkplugMetric,
} from "@/lib/constants/mqttSparkplug";

type MqttPayloadType = "JSON" | "PROTOBUF";

type MqttFormState = {
  mqttSparkplugB: boolean;
  mqttSparkplugAttributesMetricNames: string[];
  mqttTelemetryTopicFilter: string;
  mqttAttributesPublishTopicFilter: string;
  mqttAttributesSubscribeTopicFilter: string;
  mqttPayloadType: MqttPayloadType;
  mqttTelemetryProtoSchema: string;
  mqttAttributesProtoSchema: string;
  mqttRpcRequestProtoSchema: string;
  mqttRpcResponseProtoSchema: string;
  mqttEnableCompatibilityWithJsonPayloadFormat: boolean;
  mqttUseJsonPayloadFormatForDefaultDownlinkTopics: boolean;
  mqttSendPubackOnValidationFailure: boolean;
};

type UseMqttTransportFormParams<TForm extends MqttFormState> = {
  setFormState:
    | React.Dispatch<React.SetStateAction<TForm>>
    | React.Dispatch<React.SetStateAction<TForm | null>>;
};

const toMqttPayloadType = (value: string): MqttPayloadType =>
  value === "PROTOBUF" ? "PROTOBUF" : "JSON";

export function useMqttTransportForm<TForm extends MqttFormState>({
  setFormState,
}: UseMqttTransportFormParams<TForm>) {
  const setFormStateInternal = (
    updater: React.SetStateAction<TForm | null>,
  ) => {
    (setFormState as React.Dispatch<React.SetStateAction<TForm | null>>)(
      updater,
    );
  };

  const updateMqttField = <
    K extends
      | "mqttSparkplugB"
      | "mqttSparkplugAttributesMetricNames"
      | "mqttTelemetryTopicFilter"
      | "mqttAttributesPublishTopicFilter"
      | "mqttAttributesSubscribeTopicFilter"
      | "mqttTelemetryProtoSchema"
      | "mqttAttributesProtoSchema"
      | "mqttRpcRequestProtoSchema"
      | "mqttRpcResponseProtoSchema"
      | "mqttEnableCompatibilityWithJsonPayloadFormat"
      | "mqttUseJsonPayloadFormatForDefaultDownlinkTopics"
      | "mqttSendPubackOnValidationFailure",
  >(
    field: K,
    value: TForm[K],
  ) => {
    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : prev,
    );
  };

  const setMqttPayloadType = (value: string) => {
    const nextPayloadType = toMqttPayloadType(value);

    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            mqttPayloadType: nextPayloadType as TForm["mqttPayloadType"],
            ...(nextPayloadType === "PROTOBUF"
              ? {}
              : {
                  mqttEnableCompatibilityWithJsonPayloadFormat: false,
                  mqttUseJsonPayloadFormatForDefaultDownlinkTopics: false,
                }),
          }
        : prev,
    );
  };

  const setMqttSparkplugB = (enabled: boolean) => {
    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            mqttSparkplugB: enabled as TForm["mqttSparkplugB"],
            mqttSparkplugAttributesMetricNames: ensureSparkplugDefaultMetrics(
              (prev.mqttSparkplugAttributesMetricNames as string[]) ?? [
                ...DEFAULT_SPARKPLUG_ATTRIBUTES_METRIC_NAMES,
              ],
            ) as TForm["mqttSparkplugAttributesMetricNames"],
          }
        : prev,
    );
  };

  const addMqttSparkplugMetric = (metric: string) => {
    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            mqttSparkplugAttributesMetricNames: ensureSparkplugDefaultMetrics([
              ...((prev.mqttSparkplugAttributesMetricNames as string[]) ?? []),
              metric,
            ]) as TForm["mqttSparkplugAttributesMetricNames"],
          }
        : prev,
    );
  };

  const removeMqttSparkplugMetric = (metric: string) => {
    if (isDefaultSparkplugMetric(metric)) {
      return;
    }

    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            mqttSparkplugAttributesMetricNames: ensureSparkplugDefaultMetrics(
              (
                (prev.mqttSparkplugAttributesMetricNames as string[]) ?? []
              ).filter((existingMetric) => existingMetric !== metric),
            ) as TForm["mqttSparkplugAttributesMetricNames"],
          }
        : prev,
    );
  };

  return {
    updateMqttField,
    setMqttPayloadType,
    setMqttSparkplugB,
    addMqttSparkplugMetric,
    removeMqttSparkplugMetric,
  };
}
