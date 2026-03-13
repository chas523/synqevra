"use client";

import { useId, useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfoTooltip from "@/components/molecules/InfoTooltip";
import {
  ConnectivitySettingsDto,
  ProtocolConfig,
} from "@/types/generalSettingsTypes";
import { LoadingButton } from "../atoms";
import { Info } from "lucide-react";

interface DeviceConnectivityFormProps {
  initialSettings: ConnectivitySettingsDto;
  onSave: (settings: ConnectivitySettingsDto) => Promise<void>;
  isSaving?: boolean;
}

type ProtocolKey = keyof ConnectivitySettingsDto["jsonValue"];

const protocolLabels: Record<ProtocolKey, string> = {
  http: "HTTP",
  https: "HTTPS",
  mqtt: "MQTT",
  mqtts: "MQTTS",
  coap: "CoAP",
  coaps: "CoAPs",
};

const defaultPorts: Record<ProtocolKey, number> = {
  http: 8080,
  https: 443,
  mqtt: 1883,
  mqtts: 8883,
  coap: 5683,
  coaps: 5684,
};

interface ProtocolSectionProps {
  protocol: ProtocolKey;
  config: ProtocolConfig;
  onChange: (protocol: ProtocolKey, config: ProtocolConfig) => void;
  formId: string;
}

const ProtocolSection = ({
  protocol,
  config,
  onChange,
  formId,
}: ProtocolSectionProps) => {
  return (
    <div className="space-y-4 p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          {protocolLabels[protocol]}
        </Label>
        <Switch
          id={`${formId}-${protocol}-enabled`}
          checked={config.enabled}
          onCheckedChange={(checked: boolean) =>
            onChange(protocol, { ...config, enabled: checked })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-${protocol}-host`}>Host</Label>
          <Input
            id={`${formId}-${protocol}-host`}
            value={config.host}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange(protocol, { ...config, host: e.target.value })
            }
            placeholder="Leave empty for default"
            disabled={!config.enabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-${protocol}-port`}>Port</Label>
          <Input
            id={`${formId}-${protocol}-port`}
            value={config.port}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange(protocol, { ...config, port: e.target.value })
            }
            placeholder={`Default: ${defaultPorts[protocol]}`}
            disabled={!config.enabled}
          />
        </div>
      </div>
    </div>
  );
};

export const DeviceConnectivityForm = ({
  initialSettings,
  onSave,
  isSaving = false,
}: DeviceConnectivityFormProps) => {
  const formId = useId();
  const [settings, setSettings] = useState(initialSettings.jsonValue);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSettings(initialSettings.jsonValue);
    setIsDirty(false);
  }, [initialSettings]);

  const handleProtocolChange = (
    protocol: ProtocolKey,
    config: ProtocolConfig,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [protocol]: config,
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const updatedSettings: ConnectivitySettingsDto = {
        ...initialSettings,
        jsonValue: settings,
      };
      await onSave(updatedSettings);
      setIsDirty(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSettings(initialSettings.jsonValue);
    setIsDirty(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Device Connectivity</CardTitle>
        <CardAction>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>
                  Configure device connectivity settings for different
                  protocols.
                </p>
                <p>
                  Devices use these settings to connect to your ThingsBoard
                  instance.
                </p>
              </div>
            }
          />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <Tabs defaultValue="http" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="http">HTTP(s)</TabsTrigger>
            <TabsTrigger value="mqtt">MQTT(s)</TabsTrigger>
            <TabsTrigger value="coap">CoAP(s)</TabsTrigger>
          </TabsList>

          <TabsContent value="http" className="space-y-4 mt-4">
            <ProtocolSection
              protocol="http"
              config={settings.http}
              onChange={handleProtocolChange}
              formId={formId}
            />
            <ProtocolSection
              protocol="https"
              config={settings.https}
              onChange={handleProtocolChange}
              formId={formId}
            />
          </TabsContent>

          <TabsContent value="mqtt" className="space-y-4 mt-4">
            <ProtocolSection
              protocol="mqtt"
              config={settings.mqtt}
              onChange={handleProtocolChange}
              formId={formId}
            />
            <ProtocolSection
              protocol="mqtts"
              config={settings.mqtts}
              onChange={handleProtocolChange}
              formId={formId}
            />
          </TabsContent>

          <TabsContent value="coap" className="space-y-4 mt-4">
            <ProtocolSection
              protocol="coap"
              config={settings.coap}
              onChange={handleProtocolChange}
              formId={formId}
            />
            <ProtocolSection
              protocol="coaps"
              config={settings.coaps}
              onChange={handleProtocolChange}
              formId={formId}
            />
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            If host or port fields are empty, default protocol value will be
            used.
          </span>
        </div>

        <div className="flex flex-row gap-3 ml-auto">
          <Button
            type="button"
            variant="outline"
            className="w-fit h-9"
            onClick={handleReset}
            disabled={!isDirty}
          >
            Undo
          </Button>
          <LoadingButton
            type="button"
            className="w-fit h-9"
            isLoading={isSaving || isSubmitting}
            textBeforeClick="Save"
            textAfterClick="Saving..."
            disabled={!isDirty || isSaving || isSubmitting}
            onClick={handleSave}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceConnectivityForm;
