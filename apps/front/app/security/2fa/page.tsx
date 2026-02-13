"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";
import { TwoFactorAuthSettings } from "@/types/twoFactorAuthTypes";

// Schema Definitions
const providerTypeSchema = z.enum(["TOTP", "SMS", "EMAIL", "BACKUP_CODE"]);

const providerSchema = z.object({
    providerType: providerTypeSchema,
    issuerName: z.string().optional(),
    verificationCodeLifetime: z.coerce.number().optional(),
    verificationMessageTemplate: z.string().optional(),
    backupCodeCount: z.coerce.number().optional(),
    enabled: z.boolean().default(false), // Helper field for UI
});

const settingsSchema = z.object({
    providers: z.array(providerSchema),
    minVerificationCodeSendPeriod: z.coerce.number().min(0, "Must be positive"),
    verificationCodeCheckRateLimit: z.string().nullable().optional(),
    maxVerificationFailuresBeforeUserLockout: z.coerce.number().min(0),
    totalAllowedTimeForVerification: z.coerce.number().min(0),
    // Helper for rate limit toggle
    rateLimitEnabled: z.boolean().default(false),
    rateLimitAttempts: z.string().optional(),
    rateLimitTime: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
type ProviderConfig = z.infer<typeof providerSchema>;

export default function TwoFactorAuthPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            providers: [], // Will be populated
            minVerificationCodeSendPeriod: 30,
            maxVerificationFailuresBeforeUserLockout: 30,
            totalAllowedTimeForVerification: 3600,
            rateLimitEnabled: false,
            rateLimitAttempts: "3",
            rateLimitTime: "900",
        },
    });

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = form;

    const watchedProviders = useWatch({ control, name: "providers" });
    const rateLimitEnabled = useWatch({ control, name: "rateLimitEnabled" });

    // Calculate if any non-backup provider is enabled
    const isAnyPrimaryProviderEnabled = watchedProviders?.some(
        (p) => p.enabled && p.providerType !== "BACKUP_CODE"
    );

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await SettingsService.getTwoFaSettings();

                // Transform API data to Form data
                const providersMap: Record<string, ProviderConfig> = {
                    TOTP: { providerType: "TOTP", enabled: false, issuerName: "ThingsBoard" },
                    SMS: { providerType: "SMS", enabled: false, verificationMessageTemplate: "Verification code: ${code}", verificationCodeLifetime: 120 },
                    EMAIL: { providerType: "EMAIL", enabled: false, verificationCodeLifetime: 120 },
                    BACKUP_CODE: { providerType: "BACKUP_CODE", enabled: false, backupCodeCount: 10 },
                };

                // Merge existing providers
                if (data.providers) {
                    data.providers.forEach((p: any) => {
                        const type = p.providerType as string;
                        if (providersMap[type]) {
                            providersMap[type] = { ...providersMap[type], ...p, enabled: true };
                        }
                    });
                }

                // Parse rate limit string "3:900" -> attempts: 3, time: 900
                let rateLimitEnabled = false;
                let rateLimitAttempts = "3";
                let rateLimitTime = "900";

                if (data.verificationCodeCheckRateLimit) {
                    rateLimitEnabled = true;
                    const parts = data.verificationCodeCheckRateLimit.split(':');
                    if (parts.length === 2) {
                        rateLimitAttempts = parts[0];
                        rateLimitTime = parts[1];
                    }
                }

                reset({
                    providers: [
                        providersMap.TOTP,
                        providersMap.SMS,
                        providersMap.EMAIL,
                        providersMap.BACKUP_CODE,
                    ],
                    minVerificationCodeSendPeriod: data.minVerificationCodeSendPeriod || 30,
                    maxVerificationFailuresBeforeUserLockout: data.maxVerificationFailuresBeforeUserLockout || 30,
                    totalAllowedTimeForVerification: data.totalAllowedTimeForVerification || 3600,
                    rateLimitEnabled,
                    rateLimitAttempts,
                    rateLimitTime,
                });
            } catch (error) {
                toast.error("Failed to load 2FA settings");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, [reset]);

    const onSubmit = async (values: SettingsFormValues) => {
        setIsSaving(true);
        try {
            // Transform Form data back to API structure
            const activeProviders = values.providers
                .filter(p => p.enabled)
                .map(({ enabled, ...rest }) => rest);

            const payload: TwoFactorAuthSettings = {
                providers: activeProviders as any,
                minVerificationCodeSendPeriod: values.minVerificationCodeSendPeriod,
                maxVerificationFailuresBeforeUserLockout: values.maxVerificationFailuresBeforeUserLockout,
                totalAllowedTimeForVerification: values.totalAllowedTimeForVerification,
                verificationCodeCheckRateLimit: values.rateLimitEnabled
                    ? `${values.rateLimitAttempts}:${values.rateLimitTime}`
                    : null
            };

            await SettingsService.updateTwoFaSettings(payload);
            toast.success("Settings saved successfully");

            // Re-fetch to normalize state (optional)
            const data = await SettingsService.getTwoFaSettings();
        } catch (error) {
            toast.error("Failed to save settings");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-full items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="container max-w-4xl py-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Two-factor authentication</h1>
                <Button variant="ghost" size="icon">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Available Providers Section */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-medium text-muted-foreground">Available providers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* TOTP */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-normal">Authenticator app</Label>
                                <Controller
                                    control={control}
                                    name="providers.0.enabled"
                                    render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>
                            {watchedProviders?.[0]?.enabled && (
                                <div className="pl-0 pt-2 animate-in fade-in slide-in-from-top-2 duration-200 space-y-2">
                                    <Label className="text-xs text-muted-foreground">Issuer name*</Label>
                                    <Input {...register("providers.0.issuerName")} className="bg-muted/30" />
                                    {errors.providers?.[0]?.issuerName && <p className="text-xs text-destructive">{errors.providers[0].issuerName?.message}</p>}
                                </div>
                            )}
                        </div>
                        <Separator />

                        {/* SMS */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-normal">SMS</Label>
                                <Controller
                                    control={control}
                                    name="providers.1.enabled"
                                    render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>
                            {watchedProviders?.[1]?.enabled && (
                                <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Verification message template*</Label>
                                        <Input {...register("providers.1.verificationMessageTemplate")} className="bg-muted/30" />
                                        {errors.providers?.[1]?.verificationMessageTemplate && <p className="text-xs text-destructive">{errors.providers[1].verificationMessageTemplate?.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Verification code lifetime (sec)*</Label>
                                        <Input type="number" {...register("providers.1.verificationCodeLifetime")} className="bg-muted/30" />
                                        {errors.providers?.[1]?.verificationCodeLifetime && <p className="text-xs text-destructive">{errors.providers[1].verificationCodeLifetime?.message}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                        <Separator />

                        {/* EMAIL */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-normal">Email</Label>
                                <Controller
                                    control={control}
                                    name="providers.2.enabled"
                                    render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>
                            {watchedProviders?.[2]?.enabled && (
                                <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200 space-y-2">
                                    <Label className="text-xs text-muted-foreground">Verification code lifetime (sec)*</Label>
                                    <Input type="number" {...register("providers.2.verificationCodeLifetime")} className="bg-muted/30" />
                                    {errors.providers?.[2]?.verificationCodeLifetime && <p className="text-xs text-destructive">{errors.providers[2].verificationCodeLifetime?.message}</p>}
                                </div>
                            )}
                        </div>
                        <Separator />

                        {/* BACKUP CODE */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-normal">Backup code</Label>
                                <Controller
                                    control={control}
                                    name="providers.3.enabled"
                                    render={({ field }) => (
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!isAnyPrimaryProviderEnabled}
                                        />
                                    )}
                                />
                            </div>
                            {watchedProviders?.[3]?.enabled && (
                                <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200 space-y-2">
                                    <Label className="text-xs text-muted-foreground">Number of codes*</Label>
                                    <Input type="number" {...register("providers.3.backupCodeCount")} className="bg-muted/30" />
                                    {errors.providers?.[3]?.backupCodeCount && <p className="text-xs text-destructive">{errors.providers[3].backupCodeCount?.message}</p>}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Verification Limitations Section */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-medium text-muted-foreground">Verification limitations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Total allowed time for verification (sec)*</Label>
                                <Input type="number" {...register("totalAllowedTimeForVerification")} className="bg-muted/30" />
                                {errors.totalAllowedTimeForVerification && <p className="text-xs text-destructive">{errors.totalAllowedTimeForVerification.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Retry verification code period (sec)*</Label>
                                <Input type="number" {...register("minVerificationCodeSendPeriod")} className="bg-muted/30" />
                                {errors.minVerificationCodeSendPeriod && <p className="text-xs text-destructive">{errors.minVerificationCodeSendPeriod.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Max verification failures before user lockout*</Label>
                                <Input type="number" {...register("maxVerificationFailuresBeforeUserLockout")} className="bg-muted/30" />
                                {errors.maxVerificationFailuresBeforeUserLockout && <p className="text-xs text-destructive">{errors.maxVerificationFailuresBeforeUserLockout.message}</p>}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold">Verification code check rate limit</Label>
                                <Controller
                                    control={control}
                                    name="rateLimitEnabled"
                                    render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>
                        </div>

                        {rateLimitEnabled && (
                            <div className="grid grid-cols-2 gap-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Number of checking attempts*</Label>
                                    <Input {...register("rateLimitAttempts")} className="bg-muted/30" />
                                    {errors.rateLimitAttempts && <p className="text-xs text-destructive">{errors.rateLimitAttempts.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Within time (sec)*</Label>
                                    <Input {...register("rateLimitTime")} className="bg-muted/30" />
                                    {errors.rateLimitTime && <p className="text-xs text-destructive">{errors.rateLimitTime.message}</p>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
}
