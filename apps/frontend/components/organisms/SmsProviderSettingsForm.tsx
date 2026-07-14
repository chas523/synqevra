"use client";

import { useId, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InfoTooltip from "@/components/molecules/InfoTooltip";
import { LoadingButton } from "../atoms";
import { useForm, Controller } from "react-hook-form";
import {
  SmsSettings,
  SmsProviderType,
  SmsConfigJsonValue,
  AwsSnsConfig,
  TwilioConfig,
  SmppConfig,
  DEFAULT_AWS_SNS_CONFIG,
  DEFAULT_TWILIO_CONFIG,
  DEFAULT_SMPP_CONFIG,
  SMPP_PROTOCOL_VERSIONS,
  SMPP_BIND_TYPES,
  SMPP_TON_OPTIONS,
  SMPP_NPI_OPTIONS,
  SMPP_CODING_SCHEMES,
} from "@/types/notificationSettingsTypes";

interface SmsProviderSettingsFormProps {
  initialSettings: SmsSettings | null;
  onSave: (settings: SmsSettings) => Promise<void>;
  isSaving?: boolean;
}

interface FormData {
  providerType: SmsProviderType;
  // AWS SNS
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  // Twilio
  numberFrom: string;
  accountSid: string;
  accountToken: string;
  // SMPP
  protocolVersion: number;
  host: string;
  port: number;
  systemId: string;
  password: string;
  systemType: string;
  bindType: string;
  serviceType: string;
  sourceAddress: string;
  sourceTon: number;
  sourceNpi: number;
  destinationTon: number;
  destinationNpi: number;
  addressRange: string;
  codingScheme: number;
}

const getDefaultFormData = (config: SmsConfigJsonValue | null): FormData => {
  if (!config) {
    return {
      providerType: "AWS_SNS",
      ...DEFAULT_AWS_SNS_CONFIG,
      ...DEFAULT_TWILIO_CONFIG,
      ...DEFAULT_SMPP_CONFIG,
    } as FormData;
  }

  const base = {
    ...DEFAULT_AWS_SNS_CONFIG,
    ...DEFAULT_TWILIO_CONFIG,
    ...DEFAULT_SMPP_CONFIG,
  };

  if (config.type === "AWS_SNS") {
    return {
      ...base,
      providerType: "AWS_SNS",
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
    } as FormData;
  } else if (config.type === "TWILIO") {
    return {
      ...base,
      providerType: "TWILIO",
      numberFrom: config.numberFrom,
      accountSid: config.accountSid,
      accountToken: config.accountToken,
    } as FormData;
  } else {
    return {
      ...base,
      providerType: "SMPP",
      protocolVersion: config.protocolVersion,
      host: config.host,
      port: config.port,
      systemId: config.systemId,
      password: config.password,
      systemType: config.systemType || "",
      bindType: config.bindType,
      serviceType: config.serviceType || "",
      sourceAddress: config.sourceAddress || "",
      sourceTon: config.sourceTon,
      sourceNpi: config.sourceNpi,
      destinationTon: config.destinationTon,
      destinationNpi: config.destinationNpi,
      addressRange: config.addressRange || "",
      codingScheme: config.codingScheme,
    } as FormData;
  }
};

export const SmsProviderSettingsForm = ({
  initialSettings,
  onSave,
  isSaving = false,
}: SmsProviderSettingsFormProps) => {
  const formId = useId();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isValid, isSubmitting, isDirty },
    reset,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: getDefaultFormData(initialSettings?.jsonValue || null),
  });

  const providerType = watch("providerType");

  useEffect(() => {
    if (initialSettings?.jsonValue) {
      reset(getDefaultFormData(initialSettings.jsonValue));
    }
  }, [initialSettings, reset]);

  const onSubmit = async (data: FormData) => {
    let jsonValue: SmsConfigJsonValue;

    if (data.providerType === "AWS_SNS") {
      jsonValue = {
        type: "AWS_SNS",
        accessKeyId: data.accessKeyId,
        secretAccessKey: data.secretAccessKey,
        region: data.region,
      } as AwsSnsConfig;
    } else if (data.providerType === "TWILIO") {
      jsonValue = {
        type: "TWILIO",
        numberFrom: data.numberFrom,
        accountSid: data.accountSid,
        accountToken: data.accountToken,
      } as TwilioConfig;
    } else {
      jsonValue = {
        type: "SMPP",
        protocolVersion: Number(data.protocolVersion),
        host: data.host,
        port: Number(data.port),
        systemId: data.systemId,
        password: data.password,
        systemType: data.systemType,
        bindType: data.bindType as SmppConfig["bindType"],
        serviceType: data.serviceType,
        sourceAddress: data.sourceAddress,
        sourceTon: Number(data.sourceTon),
        sourceNpi: Number(data.sourceNpi),
        destinationTon: Number(data.destinationTon),
        destinationNpi: Number(data.destinationNpi),
        addressRange: data.addressRange,
        codingScheme: Number(data.codingScheme),
      } as SmppConfig;
    }

    const updatedSettings: SmsSettings = {
      ...initialSettings!,
      key: "sms",
      jsonValue,
    };
    await onSave(updatedSettings);
    reset(data);
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">SMS Provider Settings</CardTitle>
        <CardAction>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>Configure SMS provider for sending notifications.</p>
                <p>Choose between Amazon SNS, Twilio, or SMPP protocol.</p>
              </div>
            }
          />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 flex flex-col"
        >
          {/* Provider Type Selector */}
          <div className="space-y-2">
            <Label htmlFor={`${formId}-providerType`}>
              SMS Provider Type *
            </Label>
            <Controller
              name="providerType"
              control={control}
              render={({ field }) => (
                <select
                  id={`${formId}-providerType`}
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="AWS_SNS">Amazon SNS</option>
                  <option value="TWILIO">Twilio</option>
                  <option value="SMPP">SMPP</option>
                </select>
              )}
            />
          </div>

          {/* AWS SNS Fields */}
          {providerType === "AWS_SNS" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${formId}-accessKeyId`}>Access Key ID *</Label>
                <Input
                  id={`${formId}-accessKeyId`}
                  {...register("accessKeyId", {
                    required: providerType === "AWS_SNS",
                  })}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${formId}-secretAccessKey`}>
                  Secret Access Key *
                </Label>
                <Input
                  id={`${formId}-secretAccessKey`}
                  type="password"
                  {...register("secretAccessKey", {
                    required: providerType === "AWS_SNS",
                  })}
                  placeholder="Secret Access Key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${formId}-region`}>Region *</Label>
                <Input
                  id={`${formId}-region`}
                  {...register("region", {
                    required: providerType === "AWS_SNS",
                  })}
                  placeholder="us-east-1"
                />
              </div>
            </div>
          )}

          {/* Twilio Fields */}
          {providerType === "TWILIO" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${formId}-numberFrom`}>
                  Phone Number From *
                </Label>
                <Input
                  id={`${formId}-numberFrom`}
                  {...register("numberFrom", {
                    required: providerType === "TWILIO",
                  })}
                  placeholder="+15551234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${formId}-accountSid`}>Account SID *</Label>
                <Input
                  id={`${formId}-accountSid`}
                  {...register("accountSid", {
                    required: providerType === "TWILIO",
                  })}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${formId}-accountToken`}>
                  Account Token *
                </Label>
                <Input
                  id={`${formId}-accountToken`}
                  type="password"
                  {...register("accountToken", {
                    required: providerType === "TWILIO",
                  })}
                  placeholder="Your Auth Token"
                />
              </div>
            </div>
          )}

          {/* SMPP Fields */}
          {providerType === "SMPP" && (
            <div className="space-y-6">
              {/* Connection Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Connection Settings
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-protocolVersion`}>
                      Protocol Version *
                    </Label>
                    <Controller
                      name="protocolVersion"
                      control={control}
                      render={({ field }) => (
                        <select
                          id={`${formId}-protocolVersion`}
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {SMPP_PROTOCOL_VERSIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-bindType`}>Bind Type *</Label>
                    <Controller
                      name="bindType"
                      control={control}
                      render={({ field }) => (
                        <select
                          id={`${formId}-bindType`}
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {SMPP_BIND_TYPES.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-host`}>Host *</Label>
                    <Input
                      id={`${formId}-host`}
                      {...register("host", {
                        required: providerType === "SMPP",
                      })}
                      placeholder="smpp.example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-port`}>Port *</Label>
                    <Input
                      id={`${formId}-port`}
                      type="number"
                      {...register("port", {
                        required: providerType === "SMPP",
                      })}
                      placeholder="2775"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-systemId`}>System ID *</Label>
                    <Input
                      id={`${formId}-systemId`}
                      {...register("systemId", {
                        required: providerType === "SMPP",
                      })}
                      placeholder="System ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-password`}>Password *</Label>
                    <Input
                      id={`${formId}-password`}
                      type="password"
                      {...register("password", {
                        required: providerType === "SMPP",
                      })}
                      placeholder="Password"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-systemType`}>System Type</Label>
                    <Input
                      id={`${formId}-systemType`}
                      {...register("systemType")}
                      placeholder="System Type (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-serviceType`}>
                      Service Type
                    </Label>
                    <Input
                      id={`${formId}-serviceType`}
                      {...register("serviceType")}
                      placeholder="Service Type (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Source Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Source Settings
                </h4>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-sourceAddress`}>
                    Source Address
                  </Label>
                  <Input
                    id={`${formId}-sourceAddress`}
                    {...register("sourceAddress")}
                    placeholder="Source Address (optional)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-sourceTon`}>Source TON *</Label>
                    <Controller
                      name="sourceTon"
                      control={control}
                      render={({ field }) => (
                        <select
                          id={`${formId}-sourceTon`}
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {SMPP_TON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-sourceNpi`}>Source NPI *</Label>
                    <Controller
                      name="sourceNpi"
                      control={control}
                      render={({ field }) => (
                        <select
                          id={`${formId}-sourceNpi`}
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {SMPP_NPI_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Destination Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Destination Settings
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-destinationTon`}>
                      Destination TON *
                    </Label>
                    <Controller
                      name="destinationTon"
                      control={control}
                      render={({ field }) => (
                        <select
                          id={`${formId}-destinationTon`}
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {SMPP_TON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-destinationNpi`}>
                      Destination NPI *
                    </Label>
                    <Controller
                      name="destinationNpi"
                      control={control}
                      render={({ field }) => (
                        <select
                          id={`${formId}-destinationNpi`}
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {SMPP_NPI_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Additional Settings
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-addressRange`}>
                      Address Range
                    </Label>
                    <Input
                      id={`${formId}-addressRange`}
                      {...register("addressRange")}
                      placeholder="Address Range (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-codingScheme`}>
                      Coding Scheme *
                    </Label>
                    <Controller
                      name="codingScheme"
                      control={control}
                      render={({ field }) => (
                        <select
                          id={`${formId}-codingScheme`}
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {SMPP_CODING_SCHEMES.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-row gap-3 ml-auto pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-fit h-9"
              onClick={() =>
                reset(getDefaultFormData(initialSettings?.jsonValue || null))
              }
            >
              Undo
            </Button>
            <LoadingButton
              type="submit"
              className="w-fit h-9"
              isLoading={isSaving || isSubmitting}
              textBeforeClick="Save"
              textAfterClick="Saving..."
              disabled={!isDirty || isSaving || isSubmitting}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SmsProviderSettingsForm;
