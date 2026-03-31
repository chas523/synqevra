type SnmpMapping = {
  id: string;
  dataType: string;
  key: string;
  oid: string;
};

type SnmpCommunicationConfig = {
  id: string;
  spec: string;
  queryingFrequencyMs: string;
  mappings: SnmpMapping[];
};

type SnmpFormState = {
  snmpTimeoutMs: string;
  snmpRetries: string;
  snmpCommunicationConfigs: SnmpCommunicationConfig[];
};

type UseSnmpTransportFormParams<TForm extends SnmpFormState> = {
  setFormState:
    | React.Dispatch<React.SetStateAction<TForm>>
    | React.Dispatch<React.SetStateAction<TForm | null>>;
  createCommunicationConfig: () => SnmpCommunicationConfig;
  createMapping: () => SnmpMapping;
  allScopes?: string[];
  sanitizeNumeric?: boolean;
};

const onlyDigits = (value: string) => value.replace(/\D+/g, "");
const SNMP_OID_PATTERN = /^\.?([0-2])((\.0)|(\.[1-9][0-9]*))*$/;

const SNMP_SCOPES_WITHOUT_QUERYING_FREQUENCY = new Set([
  "SHARED_ATTRIBUTES",
  "SHARED_ATTRIBUTES_SETTING",
  "TO_DEVICE_RPC_REQUEST",
  "FROM_DEVICE_RPC_REQUEST",
  "TO_SERVER_RPC_REQUEST",
]);

export const requiresSnmpQueryingFrequency = (scope: string) =>
  !SNMP_SCOPES_WITHOUT_QUERYING_FREQUENCY.has(scope);

export const isValidSnmpOid = (value: string) =>
  SNMP_OID_PATTERN.test(value.trim());

export function useSnmpTransportForm<TForm extends SnmpFormState>({
  setFormState,
  createCommunicationConfig,
  createMapping,
  allScopes = [],
  sanitizeNumeric = false,
}: UseSnmpTransportFormParams<TForm>) {
  const setFormStateInternal = (
    updater: React.SetStateAction<TForm | null>,
  ) => {
    (setFormState as React.Dispatch<React.SetStateAction<TForm | null>>)(
      updater,
    );
  };

  const onTimeoutChange = (value: string) => {
    const nextValue = sanitizeNumeric ? onlyDigits(value) : value;
    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            snmpTimeoutMs: nextValue,
          }
        : prev,
    );
  };

  const onRetriesChange = (value: string) => {
    const nextValue = sanitizeNumeric ? onlyDigits(value) : value;
    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            snmpRetries: nextValue,
          }
        : prev,
    );
  };

  const onUpdateCommunicationConfig = (
    configId: string,
    field: "spec" | "queryingFrequencyMs",
    value: string,
  ) => {
    const nextValue =
      sanitizeNumeric && field === "queryingFrequencyMs"
        ? onlyDigits(value)
        : value;

    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            snmpCommunicationConfigs: prev.snmpCommunicationConfigs.map(
              (config) =>
                config.id === configId
                  ? {
                      ...config,
                      [field]: nextValue,
                    }
                  : config,
            ),
          }
        : prev,
    );
  };

  const onRemoveCommunicationConfig = (configId: string) => {
    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            snmpCommunicationConfigs:
              prev.snmpCommunicationConfigs.length > 1
                ? prev.snmpCommunicationConfigs.filter(
                    (config) => config.id !== configId,
                  )
                : prev.snmpCommunicationConfigs,
          }
        : prev,
    );
  };

  const onAddMapping = (configId: string) => {
    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            snmpCommunicationConfigs: prev.snmpCommunicationConfigs.map(
              (config) =>
                config.id === configId
                  ? {
                      ...config,
                      mappings: [...config.mappings, createMapping()],
                    }
                  : config,
            ),
          }
        : prev,
    );
  };

  const onUpdateMapping = (
    configId: string,
    mappingId: string,
    field: "dataType" | "key" | "oid",
    value: string,
  ) => {
    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            snmpCommunicationConfigs: prev.snmpCommunicationConfigs.map(
              (config) =>
                config.id === configId
                  ? {
                      ...config,
                      mappings: config.mappings.map((mapping) =>
                        mapping.id === mappingId
                          ? {
                              ...mapping,
                              [field]: value,
                            }
                          : mapping,
                      ),
                    }
                  : config,
            ),
          }
        : prev,
    );
  };

  const onRemoveMapping = (configId: string, mappingId: string) => {
    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            snmpCommunicationConfigs: prev.snmpCommunicationConfigs.map(
              (config) =>
                config.id === configId && config.mappings.length > 1
                  ? {
                      ...config,
                      mappings: config.mappings.filter(
                        (mapping) => mapping.id !== mappingId,
                      ),
                    }
                  : config,
            ),
          }
        : prev,
    );
  };

  const onAddCommunicationConfig = () => {
    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            snmpCommunicationConfigs: [
              ...prev.snmpCommunicationConfigs,
              (() => {
                const nextConfig = createCommunicationConfig();
                const usedScopes = new Set(
                  prev.snmpCommunicationConfigs.map((config) => config.spec),
                );
                const nextScope = allScopes.find(
                  (scope) => !usedScopes.has(scope),
                );

                return nextScope
                  ? {
                      ...nextConfig,
                      spec: nextScope,
                    }
                  : nextConfig;
              })(),
            ],
          }
        : prev,
    );
  };

  return {
    onTimeoutChange,
    onRetriesChange,
    onUpdateCommunicationConfig,
    onRemoveCommunicationConfig,
    onAddMapping,
    onUpdateMapping,
    onRemoveMapping,
    onAddCommunicationConfig,
  };
}
