"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Queue } from "@/types/queueTypes";
import {
  DeviceService,
  type RuleChain,
} from "@/lib/services/thingsboardServices/deviceService";
import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";
import {
  ResourceService,
  type Lwm2mObjectResource,
} from "@/lib/services/thingsboardServices/resourceService";
import type { Lwm2mObjectOption } from "@/components/molecules/Lwm2mObjectListField";

type UseDeviceProfileReferenceDataParams = {
  open: boolean;
  transportType: string;
  lwm2mActiveTab: string;
  lwm2mObjectSearch: string;
};

export function useDeviceProfileReferenceData({
  open,
  transportType,
  lwm2mActiveTab,
  lwm2mObjectSearch,
}: UseDeviceProfileReferenceDataParams) {
  const [coreRuleChains, setCoreRuleChains] = useState<RuleChain[]>([]);
  const [edgeRuleChains, setEdgeRuleChains] = useState<RuleChain[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [hasLoadedCoreRuleChains, setHasLoadedCoreRuleChains] = useState(false);
  const [hasLoadedEdgeRuleChains, setHasLoadedEdgeRuleChains] = useState(false);
  const [hasLoadedQueues, setHasLoadedQueues] = useState(false);
  const [isLoadingCoreRuleChains, setIsLoadingCoreRuleChains] = useState(false);
  const [isLoadingEdgeRuleChains, setIsLoadingEdgeRuleChains] = useState(false);
  const [isLoadingQueues, setIsLoadingQueues] = useState(false);
  const [lwm2mObjectOptions, setLwm2mObjectOptions] = useState<
    Lwm2mObjectOption[]
  >([]);
  const [lwm2mObjectDetails, setLwm2mObjectDetails] = useState<
    Record<string, Lwm2mObjectResource>
  >({});
  const [isLoadingLwm2mObjects, setIsLoadingLwm2mObjects] = useState(false);

  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const resetReferenceData = useCallback(() => {
    setCoreRuleChains([]);
    setEdgeRuleChains([]);
    setQueues([]);
    setHasLoadedCoreRuleChains(false);
    setHasLoadedEdgeRuleChains(false);
    setHasLoadedQueues(false);
    setIsLoadingCoreRuleChains(false);
    setIsLoadingEdgeRuleChains(false);
    setIsLoadingQueues(false);
    setLwm2mObjectOptions([]);
    setLwm2mObjectDetails({});
    setIsLoadingLwm2mObjects(false);
  }, []);

  const clearLwm2mObjects = useCallback(() => {
    setLwm2mObjectOptions([]);
    setLwm2mObjectDetails({});
    setIsLoadingLwm2mObjects(false);
  }, []);

  useEffect(() => {
    if (!open || transportType !== "LWM2M" || lwm2mActiveTab !== "model") {
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoadingLwm2mObjects(true);

      try {
        const data = await ResourceService.getLwm2mObjectsPage(
          0,
          50,
          lwm2mObjectSearch,
          "resourceKey",
          "ASC",
        );

        if (!openRef.current) {
          return;
        }

        setLwm2mObjectOptions(
          data
            .filter(
              (item) =>
                typeof item?.keyId === "string" &&
                typeof item?.name === "string" &&
                item.keyId.trim() &&
                item.name.trim(),
            )
            .map((item) => ({ keyId: item.keyId, name: item.name })),
        );
        setLwm2mObjectDetails(
          data.reduce<Record<string, Lwm2mObjectResource>>((acc, item) => {
            if (item?.keyId) {
              acc[item.keyId] = item;
            }
            return acc;
          }, {}),
        );
      } catch (error: any) {
        if (openRef.current) {
          toast.error(
            error?.response?.data?.message ||
              "Failed to load LWM2M object list",
          );
        }
      } finally {
        if (openRef.current) {
          setIsLoadingLwm2mObjects(false);
        }
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [open, transportType, lwm2mActiveTab, lwm2mObjectSearch]);

  const loadCoreRuleChains = useCallback(async () => {
    if (hasLoadedCoreRuleChains || isLoadingCoreRuleChains) {
      return;
    }

    try {
      setIsLoadingCoreRuleChains(true);
      const response = await DeviceService.getRuleChains("CORE");

      if (!openRef.current) {
        return;
      }

      setCoreRuleChains(response);
      setHasLoadedCoreRuleChains(true);
    } catch (error: any) {
      if (openRef.current) {
        toast.error(
          error?.response?.data?.message || "Failed to load rule chains",
        );
      }
    } finally {
      if (openRef.current) {
        setIsLoadingCoreRuleChains(false);
      }
    }
  }, [hasLoadedCoreRuleChains, isLoadingCoreRuleChains]);

  const loadEdgeRuleChains = useCallback(async () => {
    if (hasLoadedEdgeRuleChains || isLoadingEdgeRuleChains) {
      return;
    }

    try {
      setIsLoadingEdgeRuleChains(true);
      const response = await DeviceService.getRuleChains("EDGE");

      if (!openRef.current) {
        return;
      }

      setEdgeRuleChains(response);
      setHasLoadedEdgeRuleChains(true);
    } catch (error: any) {
      if (openRef.current) {
        toast.error(
          error?.response?.data?.message || "Failed to load edge rule chains",
        );
      }
    } finally {
      if (openRef.current) {
        setIsLoadingEdgeRuleChains(false);
      }
    }
  }, [hasLoadedEdgeRuleChains, isLoadingEdgeRuleChains]);

  const loadQueues = useCallback(async () => {
    if (hasLoadedQueues || isLoadingQueues) {
      return;
    }

    try {
      setIsLoadingQueues(true);
      const response = await SettingsService.getQueues(0, 50, "name", "ASC");

      if (!openRef.current) {
        return;
      }

      setQueues(response.data ?? []);
      setHasLoadedQueues(true);
    } catch (error: any) {
      if (openRef.current) {
        toast.error(error?.response?.data?.message || "Failed to load queues");
      }
    } finally {
      if (openRef.current) {
        setIsLoadingQueues(false);
      }
    }
  }, [hasLoadedQueues, isLoadingQueues]);

  return {
    coreRuleChains,
    edgeRuleChains,
    queues,
    isLoadingCoreRuleChains,
    isLoadingEdgeRuleChains,
    isLoadingQueues,
    lwm2mObjectOptions,
    lwm2mObjectDetails,
    isLoadingLwm2mObjects,
    loadCoreRuleChains,
    loadEdgeRuleChains,
    loadQueues,
    resetReferenceData,
    clearLwm2mObjects,
  };
}
