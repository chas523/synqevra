import { useState } from "react";
import type { Lwm2mObjectResource } from "@/lib/services/thingsboardServices/resourceService";

type Lwm2mObjectOptionLike = {
  keyId: string;
  name: string;
};

type Lwm2mInstanceAttributeKeyLike = "minimumPeriod" | "maximumPeriod";
type Lwm2mAttributeScopeLike = "OBJECT" | "INSTANCE";
type Lwm2mSecurityModeLike = "NO_SEC" | "PSK" | "RPK" | "X509_CERT";

type Lwm2mResourceConfigLike = {
  id: number;
  keyName: string;
  attribute: boolean;
  telemetry: boolean;
  observe: boolean;
};

type Lwm2mObjectConfigLike = {
  keyId: string;
  name: string;
  multiple: boolean;
  instances: number[];
  resources: Lwm2mResourceConfigLike[];
  instanceResources: Record<number, Lwm2mResourceConfigLike[]>;
  objectAttributes: Partial<Record<Lwm2mInstanceAttributeKeyLike, number>>;
  instanceAttributes: Record<
    number,
    Partial<Record<Lwm2mInstanceAttributeKeyLike, number>>
  >;
};

type Lwm2mBootstrapServerConfigLike = {
  id: string;
  shortServerId: string;
  bootstrapServerIs: boolean;
  host: string;
  port: string;
  clientHoldOffTime: string;
  serverPublicKey: string;
  serverCertificate: string;
  bootstrapServerAccountTimeout: string;
  lifetime: string;
  defaultMinPeriod: string;
  notifIfDisabled: boolean;
  binding: string;
  securityMode: Lwm2mSecurityModeLike;
};

type Lwm2mFormStateLike = {
  lwm2mObjectList: Lwm2mObjectOptionLike[];
  lwm2mObjectConfigs: Lwm2mObjectConfigLike[];
  lwm2mObserveStrategy: "SINGLE" | "COMPOSITE_ALL" | "COMPOSITE_BY_OBJECT";
  lwm2mBootstrapServers: Lwm2mBootstrapServerConfigLike[];
  lwm2mBootstrapServerUpdateEnable: boolean;
};

type UseLwm2mTransportFormParams<TForm extends Lwm2mFormStateLike> = {
  formState: TForm | null;
  setFormState:
    | React.Dispatch<React.SetStateAction<TForm | null>>
    | React.Dispatch<React.SetStateAction<TForm>>;
  lwm2mObjectDetails: Record<string, Lwm2mObjectResource>;
  lwm2mObjectSearch?: string;
  setLwm2mObjectSearch?: React.Dispatch<React.SetStateAction<string>>;
  createDefaultLwm2mServerConfig: () => Lwm2mBootstrapServerConfigLike;
  createDefaultLwm2mBootstrapUpdateServerConfig: () => Lwm2mBootstrapServerConfigLike;
  sanitizeIpv4Input: (value: string) => string;
  attributeOptions: Array<{
    value: Lwm2mInstanceAttributeKeyLike;
    label: string;
  }>;
};

const cloneLwm2mResources = (resources: Lwm2mResourceConfigLike[]) =>
  resources.map((resource) => ({ ...resource }));

export function useLwm2mTransportForm<TForm extends Lwm2mFormStateLike>({
  formState,
  setFormState,
  lwm2mObjectDetails,
  lwm2mObjectSearch,
  setLwm2mObjectSearch,
  createDefaultLwm2mServerConfig,
  createDefaultLwm2mBootstrapUpdateServerConfig,
  sanitizeIpv4Input,
  attributeOptions,
}: UseLwm2mTransportFormParams<TForm>) {
  const setFormStateInternal = (
    updater: React.SetStateAction<TForm | null>,
  ) => {
    (setFormState as React.Dispatch<React.SetStateAction<TForm | null>>)(
      updater,
    );
  };

  const [lwm2mObjectSearchState, setLwm2mObjectSearchState] = useState("");
  const currentLwm2mObjectSearch = lwm2mObjectSearch ?? lwm2mObjectSearchState;
  const setCurrentLwm2mObjectSearch =
    setLwm2mObjectSearch ?? setLwm2mObjectSearchState;
  const [expandedLwm2mObjectKeys, setExpandedLwm2mObjectKeys] = useState<
    Set<string>
  >(new Set());
  const [expandedLwm2mBootstrapServerIds, setExpandedLwm2mBootstrapServerIds] =
    useState<Set<string>>(new Set());
  const [instanceDialogObjectKey, setInstanceDialogObjectKey] = useState<
    string | null
  >(null);
  const [instanceDraftInput, setInstanceDraftInput] = useState("");
  const [instanceDraftValues, setInstanceDraftValues] = useState<number[]>([]);
  const [attributeDialogObjectKey, setAttributeDialogObjectKey] = useState<
    string | null
  >(null);
  const [attributeDialogScope, setAttributeDialogScope] =
    useState<Lwm2mAttributeScopeLike | null>(null);
  const [attributeDialogInstanceId, setAttributeDialogInstanceId] = useState<
    number | null
  >(null);
  const [attributeDraftValues, setAttributeDraftValues] = useState<
    Partial<Record<Lwm2mInstanceAttributeKeyLike, number>>
  >({});
  const [attributeDraftName, setAttributeDraftName] =
    useState<Lwm2mInstanceAttributeKeyLike>("minimumPeriod");
  const [attributeDraftValue, setAttributeDraftValue] = useState("");

  const resetLwm2mUiState = () => {
    setCurrentLwm2mObjectSearch("");
    setExpandedLwm2mObjectKeys(new Set());
    setExpandedLwm2mBootstrapServerIds(new Set());
    setInstanceDialogObjectKey(null);
    setInstanceDraftInput("");
    setInstanceDraftValues([]);
    setAttributeDialogObjectKey(null);
    setAttributeDialogScope(null);
    setAttributeDialogInstanceId(null);
    setAttributeDraftValues({});
    setAttributeDraftName("minimumPeriod");
    setAttributeDraftValue("");
  };

  const updateLwm2mObjectConfig = (
    keyId: string,
    updater: (config: Lwm2mObjectConfigLike) => Lwm2mObjectConfigLike,
  ) => {
    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            lwm2mObjectConfigs: prev.lwm2mObjectConfigs.map((config) =>
              config.keyId === keyId ? updater(config) : config,
            ),
          }
        : prev,
    );
  };

  const addLwm2mObject = (option: Lwm2mObjectOptionLike) => {
    const resourceDetails = lwm2mObjectDetails[option.keyId];

    setFormStateInternal((prev) => {
      if (
        !prev ||
        prev.lwm2mObjectList.some((item) => item.keyId === option.keyId)
      ) {
        return prev;
      }

      const resources =
        resourceDetails?.instances?.[0]?.resources?.map((resource) => ({
          id: resource.id,
          keyName: resource.keyName,
          attribute: Boolean(resource.attribute),
          telemetry: Boolean(resource.telemetry),
          observe: Boolean(resource.observe),
        })) ?? [];

      return {
        ...prev,
        lwm2mObjectList: [...prev.lwm2mObjectList, option],
        lwm2mObjectConfigs: [
          ...prev.lwm2mObjectConfigs,
          {
            keyId: option.keyId,
            name: option.name,
            multiple: Boolean(resourceDetails?.multiple),
            instances: [0],
            resources,
            instanceResources: {
              0: cloneLwm2mResources(resources),
            },
            objectAttributes: {},
            instanceAttributes: {
              0: {},
            },
          },
        ],
        lwm2mObserveStrategy:
          prev.lwm2mObserveStrategy === "SINGLE"
            ? "COMPOSITE_BY_OBJECT"
            : prev.lwm2mObserveStrategy,
      };
    });
  };

  const removeLwm2mObject = (keyId: string) => {
    setFormStateInternal((prev) => {
      if (!prev) {
        return prev;
      }

      const nextObjectList = prev.lwm2mObjectList.filter(
        (item) => item.keyId !== keyId,
      );
      return {
        ...prev,
        lwm2mObjectList: nextObjectList,
        lwm2mObjectConfigs: prev.lwm2mObjectConfigs.filter(
          (item) => item.keyId !== keyId,
        ),
        lwm2mObserveStrategy:
          nextObjectList.length === 0 ? "SINGLE" : prev.lwm2mObserveStrategy,
      };
    });

    setExpandedLwm2mObjectKeys((prev) => {
      const next = new Set(prev);
      next.delete(keyId);
      return next;
    });
  };

  const toggleLwm2mObjectExpanded = (keyId: string) => {
    setExpandedLwm2mObjectKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  const toggleLwm2mResourceFlag = (
    objectKeyId: string,
    instanceId: number,
    resourceId: number,
    flag: "attribute" | "telemetry" | "observe",
    checked: boolean,
  ) => {
    updateLwm2mObjectConfig(objectKeyId, (config) => ({
      ...config,
      instanceResources: {
        ...(config.instanceResources ?? {}),
        [instanceId]: (
          config.instanceResources?.[instanceId] ??
          cloneLwm2mResources(config.resources)
        ).map((resource) => {
          if (resource.id !== resourceId) {
            return resource;
          }

          if (flag === "observe") {
            if (checked && !resource.attribute && !resource.telemetry) {
              return resource;
            }

            return {
              ...resource,
              observe: checked,
            };
          }

          const nextAttribute =
            flag === "attribute" ? checked : resource.attribute;
          const nextTelemetry =
            flag === "telemetry" ? checked : resource.telemetry;

          return {
            ...resource,
            [flag]: checked,
            observe:
              !nextAttribute && !nextTelemetry ? false : resource.observe,
          };
        }),
      },
    }));
  };

  const toggleLwm2mInstanceBulk = (
    objectKeyId: string,
    instanceId: number,
    mode: "attribute" | "telemetry" | "observe",
    checked: boolean,
  ) => {
    updateLwm2mObjectConfig(objectKeyId, (config) => ({
      ...config,
      instanceResources: {
        ...(config.instanceResources ?? {}),
        [instanceId]: (
          config.instanceResources?.[instanceId] ??
          cloneLwm2mResources(config.resources)
        ).map((resource) => {
          if (mode === "observe") {
            return {
              ...resource,
              observe: checked
                ? resource.attribute || resource.telemetry
                : false,
            };
          }

          const nextAttribute =
            mode === "attribute" ? checked : resource.attribute;
          const nextTelemetry =
            mode === "telemetry" ? checked : resource.telemetry;

          return {
            ...resource,
            [mode]: checked,
            observe:
              !nextAttribute && !nextTelemetry ? false : resource.observe,
          };
        }),
      },
    }));
  };

  const handleLwm2mResourceKeyNameChange = (
    objectKeyId: string,
    instanceId: number,
    resourceId: number,
    value: string,
  ) => {
    updateLwm2mObjectConfig(objectKeyId, (config) => ({
      ...config,
      instanceResources: {
        ...(config.instanceResources ?? {}),
        [instanceId]: (
          config.instanceResources?.[instanceId] ??
          cloneLwm2mResources(config.resources)
        ).map((resource) =>
          resource.id === resourceId
            ? { ...resource, keyName: value }
            : resource,
        ),
      },
    }));
  };

  const openInstanceDialog = (objectKeyId: string) => {
    const objectConfig = formState?.lwm2mObjectConfigs.find(
      (item) => item.keyId === objectKeyId,
    );
    if (!objectConfig?.multiple) {
      return;
    }

    setInstanceDialogObjectKey(objectKeyId);
    setInstanceDraftInput("");
    setInstanceDraftValues(
      Array.from(new Set(objectConfig.instances)).sort((a, b) => a - b),
    );
  };

  const parseInstanceNumbers = (raw: string): number[] =>
    raw
      .split(/[\s,;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => Number(item))
      .filter((value) => Number.isInteger(value) && value >= 0);

  const appendInstanceDraftValue = () => {
    const trimmed = instanceDraftInput.trim();
    if (!trimmed) {
      return;
    }

    const parsedValues = parseInstanceNumbers(trimmed);
    if (parsedValues.length === 0) {
      return;
    }

    setInstanceDraftValues((prev) =>
      Array.from(new Set([...prev, ...parsedValues])).sort((a, b) => a - b),
    );
    setInstanceDraftInput("");
  };

  const removeInstanceDraftValue = (value: number) => {
    setInstanceDraftValues((prev) => prev.filter((item) => item !== value));
  };

  const closeInstanceDialog = () => {
    setInstanceDialogObjectKey(null);
    setInstanceDraftInput("");
    setInstanceDraftValues([]);
  };

  const saveInstanceDraftValues = () => {
    const pendingValues = parseInstanceNumbers(instanceDraftInput.trim());
    const valuesToSave =
      pendingValues.length === 0
        ? instanceDraftValues
        : Array.from(new Set([...instanceDraftValues, ...pendingValues]));

    if (!instanceDialogObjectKey || valuesToSave.length === 0) {
      closeInstanceDialog();
      return;
    }

    updateLwm2mObjectConfig(instanceDialogObjectKey, (config) => ({
      ...config,
      instances: Array.from(new Set(valuesToSave)).sort((a, b) => a - b),
      instanceResources: Array.from(new Set(valuesToSave))
        .sort((a, b) => a - b)
        .reduce(
          (acc, instanceId) => {
            acc[instanceId] = cloneLwm2mResources(
              config.instanceResources?.[instanceId] ?? config.resources,
            );
            return acc;
          },
          {} as Record<number, Lwm2mResourceConfigLike[]>,
        ),
      instanceAttributes: Array.from(new Set(valuesToSave))
        .sort((a, b) => a - b)
        .reduce(
          (acc, instanceId) => {
            acc[instanceId] = {
              ...(config.instanceAttributes?.[instanceId] ?? {}),
            };
            return acc;
          },
          {} as Record<
            number,
            Partial<Record<Lwm2mInstanceAttributeKeyLike, number>>
          >,
        ),
    }));

    closeInstanceDialog();
  };

  const closeAttributeDialog = () => {
    setAttributeDialogObjectKey(null);
    setAttributeDialogScope(null);
    setAttributeDialogInstanceId(null);
    setAttributeDraftValues({});
    setAttributeDraftName("minimumPeriod");
    setAttributeDraftValue("");
  };

  const openObjectAttributeDialog = (objectKeyId: string) => {
    const objectConfig = formState?.lwm2mObjectConfigs.find(
      (item) => item.keyId === objectKeyId,
    );
    if (!objectConfig) {
      return;
    }

    const currentValues = { ...(objectConfig.objectAttributes ?? {}) };
    const firstAvailableOption =
      attributeOptions.find(
        ({ value }) => typeof currentValues[value] === "undefined",
      )?.value ?? "minimumPeriod";

    setAttributeDialogObjectKey(objectKeyId);
    setAttributeDialogScope("OBJECT");
    setAttributeDialogInstanceId(null);
    setAttributeDraftValues(currentValues);
    setAttributeDraftName(firstAvailableOption);
    setAttributeDraftValue("");
  };

  const openInstanceAttributeDialog = (
    objectKeyId: string,
    instanceId: number,
  ) => {
    const objectConfig = formState?.lwm2mObjectConfigs.find(
      (item) => item.keyId === objectKeyId,
    );
    if (!objectConfig) {
      return;
    }

    const hasInstanceSelectedResources = (
      objectConfig.instanceResources?.[instanceId] ?? objectConfig.resources
    ).some((resource) => resource.attribute || resource.telemetry);
    if (!hasInstanceSelectedResources) {
      return;
    }

    const currentValues = {
      ...(objectConfig.instanceAttributes?.[instanceId] ?? {}),
    };
    const firstAvailableOption =
      attributeOptions.find(
        ({ value }) => typeof currentValues[value] === "undefined",
      )?.value ?? "minimumPeriod";

    setAttributeDialogObjectKey(objectKeyId);
    setAttributeDialogScope("INSTANCE");
    setAttributeDialogInstanceId(instanceId);
    setAttributeDraftValues(currentValues);
    setAttributeDraftName(firstAvailableOption);
    setAttributeDraftValue("");
  };

  const appendAttributeDraftValue = () => {
    const numericValue = Number(attributeDraftValue);
    if (!Number.isFinite(numericValue)) {
      return;
    }

    const nextValues = {
      ...attributeDraftValues,
      [attributeDraftName]: numericValue,
    };
    const firstAvailableOption =
      attributeOptions.find(
        ({ value }) => typeof nextValues[value] === "undefined",
      )?.value ?? attributeDraftName;

    setAttributeDraftValues(nextValues);
    setAttributeDraftName(firstAvailableOption);
    setAttributeDraftValue("");
  };

  const removeAttributeDraftValue = (key: Lwm2mInstanceAttributeKeyLike) => {
    setAttributeDraftValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const saveAttributeDraftValues = () => {
    if (!attributeDialogObjectKey || !attributeDialogScope) {
      closeAttributeDialog();
      return;
    }

    updateLwm2mObjectConfig(attributeDialogObjectKey, (config) => {
      if (attributeDialogScope === "OBJECT") {
        return {
          ...config,
          objectAttributes: { ...attributeDraftValues },
        };
      }

      if (attributeDialogInstanceId === null) {
        return config;
      }

      return {
        ...config,
        instanceAttributes: {
          ...config.instanceAttributes,
          [attributeDialogInstanceId]: { ...attributeDraftValues },
        },
      };
    });

    closeAttributeDialog();
  };

  const toggleBootstrapServerUpdates = (checked: boolean) => {
    setFormStateInternal((prev) => {
      if (!prev) {
        return prev;
      }

      const hasBootstrapServer = prev.lwm2mBootstrapServers.some(
        (server) => server.bootstrapServerIs,
      );

      if (checked && !hasBootstrapServer) {
        return {
          ...prev,
          lwm2mBootstrapServerUpdateEnable: true,
          lwm2mBootstrapServers: [
            ...prev.lwm2mBootstrapServers,
            createDefaultLwm2mBootstrapUpdateServerConfig(),
          ],
        };
      }

      if (!checked && hasBootstrapServer) {
        return {
          ...prev,
          lwm2mBootstrapServerUpdateEnable: false,
          lwm2mBootstrapServers: prev.lwm2mBootstrapServers.filter(
            (server) => !server.bootstrapServerIs,
          ),
        };
      }

      return {
        ...prev,
        lwm2mBootstrapServerUpdateEnable: checked,
      };
    });
  };

  const addLwm2mBootstrapServer = () => {
    setFormStateInternal((prev) => {
      if (!prev) {
        return prev;
      }

      const sourceServer =
        prev.lwm2mBootstrapServers.find(
          (server) => !server.bootstrapServerIs,
        ) ?? createDefaultLwm2mServerConfig();
      const nextServer: Lwm2mBootstrapServerConfigLike = {
        ...sourceServer,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        bootstrapServerIs: false,
      };

      return {
        ...prev,
        lwm2mBootstrapServers: [...prev.lwm2mBootstrapServers, nextServer],
      };
    });
  };

  const removeLwm2mBootstrapServer = (serverId: string) => {
    setFormStateInternal((prev) => {
      if (!prev) {
        return prev;
      }

      const nextServers = prev.lwm2mBootstrapServers.filter(
        (server) => server.id !== serverId,
      );

      return {
        ...prev,
        lwm2mBootstrapServers:
          nextServers.length > 0
            ? nextServers
            : [createDefaultLwm2mServerConfig()],
        lwm2mBootstrapServerUpdateEnable: nextServers.some(
          (server) => server.bootstrapServerIs,
        ),
      };
    });

    setExpandedLwm2mBootstrapServerIds((prev) => {
      const next = new Set(prev);
      next.delete(serverId);
      return next;
    });
  };

  const toggleLwm2mBootstrapServerExpanded = (serverId: string) => {
    setExpandedLwm2mBootstrapServerIds((prev) => {
      const next = new Set(prev);
      if (next.has(serverId)) {
        next.delete(serverId);
      } else {
        next.add(serverId);
      }
      return next;
    });
  };

  const updateLwm2mBootstrapServer = (
    serverId: string,
    field: keyof Lwm2mBootstrapServerConfigLike,
    value: string | boolean,
  ) => {
    const numericFields = new Set<keyof Lwm2mBootstrapServerConfigLike>([
      "shortServerId",
      "port",
      "clientHoldOffTime",
      "bootstrapServerAccountTimeout",
      "lifetime",
      "defaultMinPeriod",
    ]);

    setFormStateInternal((prev) =>
      prev
        ? {
            ...prev,
            lwm2mBootstrapServers: prev.lwm2mBootstrapServers.map((server) =>
              server.id === serverId
                ? (() => {
                    if (field === "notifIfDisabled") {
                      return {
                        ...server,
                        notifIfDisabled: Boolean(value),
                      };
                    }

                    if (field === "securityMode") {
                      const nextMode = String(value) as Lwm2mSecurityModeLike;
                      const nextPort = server.bootstrapServerIs
                        ? nextMode === "NO_SEC"
                          ? "5687"
                          : "5688"
                        : nextMode === "NO_SEC"
                          ? "5685"
                          : "5686";

                      return {
                        ...server,
                        securityMode: nextMode,
                        port: nextPort,
                      };
                    }

                    if (field === "host") {
                      return {
                        ...server,
                        host: sanitizeIpv4Input(String(value)),
                      };
                    }

                    if (numericFields.has(field)) {
                      return {
                        ...server,
                        [field]: String(value).replace(/\D+/g, ""),
                      };
                    }

                    return {
                      ...server,
                      [field]: String(value),
                    };
                  })()
                : server,
            ),
          }
        : prev,
    );
  };

  return {
    lwm2mObjectSearch: currentLwm2mObjectSearch,
    setLwm2mObjectSearch: setCurrentLwm2mObjectSearch,
    expandedLwm2mObjectKeys,
    expandedLwm2mBootstrapServerIds,
    instanceDialogObjectKey,
    instanceDraftInput,
    setInstanceDraftInput,
    instanceDraftValues,
    attributeDialogObjectKey,
    attributeDialogScope,
    attributeDialogInstanceId,
    attributeDraftValues,
    attributeDraftName,
    setAttributeDraftName,
    attributeDraftValue,
    setAttributeDraftValue,
    resetLwm2mUiState,
    addLwm2mObject,
    removeLwm2mObject,
    toggleLwm2mObjectExpanded,
    toggleLwm2mResourceFlag,
    toggleLwm2mInstanceBulk,
    handleLwm2mResourceKeyNameChange,
    openInstanceDialog,
    appendInstanceDraftValue,
    removeInstanceDraftValue,
    closeInstanceDialog,
    saveInstanceDraftValues,
    closeAttributeDialog,
    openObjectAttributeDialog,
    openInstanceAttributeDialog,
    appendAttributeDraftValue,
    removeAttributeDraftValue,
    saveAttributeDraftValues,
    toggleBootstrapServerUpdates,
    addLwm2mBootstrapServer,
    removeLwm2mBootstrapServer,
    toggleLwm2mBootstrapServerExpanded,
    updateLwm2mBootstrapServer,
  };
}
