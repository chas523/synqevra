export const DEFAULT_LWM2M_COAP_RESOURCE = "coap://localhost:5685";

export type Lwm2mSecurityMode = "NO_SEC" | "PSK" | "RPK" | "X509_CERT";

export type Lwm2mResourceConfigLike = {
  id: number;
  keyName: string;
  attribute: boolean;
  telemetry: boolean;
  observe: boolean;
};

export type Lwm2mInstanceAttributesLike = {
  minimumPeriod?: number;
  maximumPeriod?: number;
};

export type Lwm2mObjectConfigLike = {
  keyId: string;
  instances: number[];
  resources: Lwm2mResourceConfigLike[];
  instanceResources?: Record<number, Lwm2mResourceConfigLike[]>;
  objectAttributes?: Lwm2mInstanceAttributesLike;
  instanceAttributes?: Record<number, Lwm2mInstanceAttributesLike>;
};

export type Lwm2mBootstrapServerConfigLike = {
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
  securityMode: Lwm2mSecurityMode;
};

export type Lwm2mFormStateLike = {
  lwm2mObjectConfigs: Lwm2mObjectConfigLike[];
  lwm2mObserveStrategy: "SINGLE" | "COMPOSITE_ALL" | "COMPOSITE_BY_OBJECT";
  lwm2mBootstrapServers: Lwm2mBootstrapServerConfigLike[];
  lwm2mBootstrapServerUpdateEnable: boolean;
  lwm2mUseObject19ForOtaInfo: boolean;
  lwm2mFirmwareUpdateStrategy: "1" | "2" | "3";
  lwm2mFirmwareUpdateCoapResource: string;
  lwm2mSoftwareUpdateStrategy: "1" | "2";
  lwm2mSoftwareUpdateCoapResource: string;
  lwm2mPowerMode: "DRX" | "EDRX" | "PSM";
  lwm2mPsmActivityTimer: string;
  lwm2mPsmActivityTimerTimeUnit:
    | "MILLISECONDS"
    | "SECONDS"
    | "MINUTES"
    | "HOURS";
  lwm2mEdrxCycle: string;
  lwm2mEdrxCycleTimeUnit: "MILLISECONDS" | "SECONDS" | "MINUTES" | "HOURS";
  lwm2mPagingTransmissionWindow: string;
  lwm2mPagingTransmissionWindowTimeUnit:
    | "MILLISECONDS"
    | "SECONDS"
    | "MINUTES"
    | "HOURS";
  lwm2mDefaultObjectVersion: "1.0" | "1.1" | "1.2";
};

const cloneLwm2mResources = (resources: Lwm2mResourceConfigLike[]) =>
  resources.map((resource) => ({ ...resource }));

const toThingsboardLwm2mSecurityMode = (mode: Lwm2mSecurityMode) =>
  mode === "X509_CERT" ? "X509" : mode;

const buildLwm2mAttributeLwm2m = (configs: Lwm2mObjectConfigLike[]) => {
  const attributeLwm2m: Record<string, { pmin?: number; pmax?: number }> = {};

  configs.forEach((config) => {
    const objectMinimumPeriod =
      typeof config.objectAttributes?.minimumPeriod === "number" &&
      Number.isFinite(config.objectAttributes.minimumPeriod)
        ? config.objectAttributes.minimumPeriod
        : undefined;
    const objectMaximumPeriod =
      typeof config.objectAttributes?.maximumPeriod === "number" &&
      Number.isFinite(config.objectAttributes.maximumPeriod)
        ? config.objectAttributes.maximumPeriod
        : undefined;

    if (
      typeof objectMinimumPeriod === "number" ||
      typeof objectMaximumPeriod === "number"
    ) {
      attributeLwm2m[`/${config.keyId}`] = {
        ...(typeof objectMinimumPeriod === "number"
          ? { pmin: objectMinimumPeriod }
          : {}),
        ...(typeof objectMaximumPeriod === "number"
          ? { pmax: objectMaximumPeriod }
          : {}),
      };
    }

    config.instances.forEach((instanceId) => {
      const current = config.instanceAttributes?.[instanceId] ?? {};
      const hasSelectedResources = (
        config.instanceResources?.[instanceId] ?? config.resources
      ).some((resource) => resource.attribute || resource.telemetry);
      const minimumPeriod =
        typeof current.minimumPeriod === "number" &&
        Number.isFinite(current.minimumPeriod)
          ? current.minimumPeriod
          : undefined;
      const maximumPeriod =
        typeof current.maximumPeriod === "number" &&
        Number.isFinite(current.maximumPeriod)
          ? current.maximumPeriod
          : undefined;

      if (
        !hasSelectedResources ||
        (typeof minimumPeriod === "undefined" &&
          typeof maximumPeriod === "undefined")
      ) {
        return;
      }

      attributeLwm2m[`/${config.keyId}/${instanceId}`] = {
        ...(typeof minimumPeriod === "number" ? { pmin: minimumPeriod } : {}),
        ...(typeof maximumPeriod === "number" ? { pmax: maximumPeriod } : {}),
      };
    });
  });

  return attributeLwm2m;
};

const buildLwm2mObserveMappings = (configs: Lwm2mObjectConfigLike[]) => {
  const telemetry = new Set<string>();
  const attribute = new Set<string>();
  const observe = new Set<string>();
  const keyName: Record<string, string> = {};

  configs.forEach((config) => {
    config.instances.forEach((instanceId) => {
      const resources =
        config.instanceResources?.[instanceId] ??
        cloneLwm2mResources(config.resources);

      resources.forEach((resource) => {
        const path = `/${config.keyId}/${instanceId}/${resource.id}`;

        if (resource.attribute) {
          attribute.add(path);
        }

        if (resource.telemetry) {
          telemetry.add(path);
        }

        if (resource.observe && (resource.attribute || resource.telemetry)) {
          observe.add(path);
        }

        if ((resource.attribute || resource.telemetry) && resource.keyName) {
          keyName[path] = resource.keyName;
        }
      });
    });
  });

  return {
    observe: Array.from(observe),
    attribute: Array.from(attribute),
    telemetry: Array.from(telemetry),
    keyName,
  };
};

export const buildLwm2mTransportConfigurationFromForm = (
  state: Lwm2mFormStateLike,
) => {
  const observeMappings = buildLwm2mObserveMappings(state.lwm2mObjectConfigs);
  const attributeLwm2m = buildLwm2mAttributeLwm2m(state.lwm2mObjectConfigs);

  return {
    observeAttr: {
      observe: observeMappings.observe,
      attribute: observeMappings.attribute,
      telemetry: observeMappings.telemetry,
      keyName: observeMappings.keyName,
      attributeLwm2m,
      observeStrategy: state.lwm2mObserveStrategy,
    },
    bootstrap:
      state.lwm2mBootstrapServers.length > 0
        ? state.lwm2mBootstrapServers.map((server) => ({
            shortServerId: Math.max(0, Number(server.shortServerId) || 0),
            bootstrapServerIs: Boolean(server.bootstrapServerIs),
            host: server.host.trim() || "0.0.0.0",
            port: Math.max(0, Number(server.port) || 0),
            clientHoldOffTime: Math.max(
              0,
              Number(server.clientHoldOffTime) || 0,
            ),
            serverPublicKey: server.serverPublicKey,
            serverCertificate: server.serverCertificate,
            bootstrapServerAccountTimeout: Math.max(
              0,
              Number(server.bootstrapServerAccountTimeout) || 0,
            ),
            lifetime: Math.max(0, Number(server.lifetime) || 0),
            defaultMinPeriod: Math.max(0, Number(server.defaultMinPeriod) || 0),
            notifIfDisabled: Boolean(server.notifIfDisabled),
            binding: server.binding || "U",
            securityMode: toThingsboardLwm2mSecurityMode(server.securityMode),
          }))
        : [
            {
              shortServerId: 123,
              bootstrapServerIs: false,
              host: "0.0.0.0",
              port: 5685,
              clientHoldOffTime: 1,
              serverPublicKey: "",
              serverCertificate: "",
              bootstrapServerAccountTimeout: 1,
              lifetime: 300,
              defaultMinPeriod: 1,
              notifIfDisabled: true,
              binding: "U",
              securityMode: "NO_SEC",
            },
          ],
    clientLwM2mSettings: {
      clientOnlyObserveAfterConnect: 1,
      useObject19ForOtaInfo: state.lwm2mUseObject19ForOtaInfo,
      fwUpdateStrategy: Math.max(
        1,
        Math.min(3, Number(state.lwm2mFirmwareUpdateStrategy) || 1),
      ),
      swUpdateStrategy: Math.max(
        1,
        Math.min(2, Number(state.lwm2mSoftwareUpdateStrategy) || 1),
      ),
      fwUpdateResource:
        state.lwm2mFirmwareUpdateStrategy === "2"
          ? state.lwm2mFirmwareUpdateCoapResource.trim() ||
            DEFAULT_LWM2M_COAP_RESOURCE
          : "",
      swUpdateResource:
        state.lwm2mSoftwareUpdateStrategy === "2"
          ? state.lwm2mSoftwareUpdateCoapResource.trim() ||
            DEFAULT_LWM2M_COAP_RESOURCE
          : "",
      powerMode: state.lwm2mPowerMode,
      psmActivityTimer:
        state.lwm2mPowerMode === "PSM"
          ? Math.max(1, Number(state.lwm2mPsmActivityTimer) || 1)
          : 0,
      psmActivityTimerTimeUnit: state.lwm2mPsmActivityTimerTimeUnit,
      edrxCycle:
        state.lwm2mPowerMode === "EDRX"
          ? Math.max(1, Number(state.lwm2mEdrxCycle) || 1)
          : 0,
      edrxCycleTimeUnit: state.lwm2mEdrxCycleTimeUnit,
      pagingTransmissionWindow:
        state.lwm2mPowerMode === "EDRX"
          ? Math.max(1, Number(state.lwm2mPagingTransmissionWindow) || 1)
          : 0,
      pagingTransmissionWindowTimeUnit:
        state.lwm2mPagingTransmissionWindowTimeUnit,
      defaultObjectIDVer: state.lwm2mDefaultObjectVersion,
    },
    type: "LWM2M",
    bootstrapServerUpdateEnable: state.lwm2mBootstrapServerUpdateEnable,
  };
};
