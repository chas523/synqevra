"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { CopyButton } from "@/components/molecules/CopyButton";
import type { Device } from "@/types/thingsboardDeviceTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

type CredentialsType = "ACCESS_TOKEN" | "X509_CERTIFICATE" | "MQTT_BASIC";

interface DeviceCredentials {
    id: { id: string };
    createdTime: number;
    deviceId: { entityType: string; id: string };
    credentialsType: CredentialsType;
    credentialsId: string | null;
    credentialsValue: string | null;
    version: number;
}

interface MqttBasicValue {
    clientId: string | null;
    userName: string;
    password: string | null;
}

interface DeviceCredentialsDialogProps {
    open: boolean;
    device: Device | null;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CREDENTIAL_TYPE_LABELS: Record<CredentialsType, string> = {
    ACCESS_TOKEN: "Access token",
    X509_CERTIFICATE: "X.509",
    MQTT_BASIC: "MQTT Basic",
};

const CREDENTIAL_TYPES: CredentialsType[] = [
    "ACCESS_TOKEN",
    "X509_CERTIFICATE",
    "MQTT_BASIC",
];

/** Generates a random 20-char alphanumeric token */
function generateToken(length = 20): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join("");
}

// ─── Copy button ──────────────────────────────────────────────────────────────


// ─── Generate button ──────────────────────────────────────────────────────────

function GenerateButton({ onClick }: { onClick: () => void }) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            title="Generate"
            onClick={onClick}
        >
            <RefreshCw className="h-4 w-4" />
        </Button>
    );
}

// ─── Token field (Input + Generate or Copy) ───────────────────────────────────

function TokenField({
    value,
    onChange,
    label,
    required,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    label: string;
    required?: boolean;
    placeholder?: string;
}) {
    const hasCopy = value.trim().length > 0;

    return (
        <div className="space-y-1.5">
            <Label>
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            <div className="flex gap-1">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder ?? label}
                    className="font-mono text-sm"
                />
                {hasCopy ? (
                    <CopyButton value={value} variant="ghost" size="icon" className="h-8 w-8 shrink-0" />
                ) : (
                    <GenerateButton onClick={() => onChange(generateToken())} />
                )}
            </div>
        </div>
    );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export const DeviceCredentialsDialog = ({
    open,
    device,
    onOpenChange,
    onSuccess,
}: DeviceCredentialsDialogProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Raw credentials from server (needed for the save payload's id/deviceId)
    const [serverCreds, setServerCreds] = useState<DeviceCredentials | null>(null);

    // Selected type
    const [credType, setCredType] = useState<CredentialsType>("ACCESS_TOKEN");

    // Access Token
    const [accessToken, setAccessToken] = useState("");

    // X.509
    const [pemCert, setPemCert] = useState("");

    // MQTT Basic
    const [mqttClientId, setMqttClientId] = useState("");
    const [mqttUsername, setMqttUsername] = useState("");
    const [mqttPassword, setMqttPassword] = useState("");

    // ── Load credentials on open ────────────────────────────────────────────────

    useEffect(() => {
        if (!open || !device) return;

        const loadCredentials = async () => {
            setIsLoading(true);
            try {
                const creds: DeviceCredentials = await DeviceService.getDeviceCredentials(
                    device.id?.id ?? ""
                );
                setServerCreds(creds);
                applyCredentials(creds);
            } catch {
                toast.error("Failed to load device credentials");
            } finally {
                setIsLoading(false);
            }
        };

        loadCredentials();
    }, [open, device]);

    const applyCredentials = (creds: DeviceCredentials) => {
        setCredType(creds.credentialsType ?? "ACCESS_TOKEN");
        if (creds.credentialsType === "ACCESS_TOKEN") {
            setAccessToken(creds.credentialsId ?? "");
        } else if (creds.credentialsType === "X509_CERTIFICATE") {
            setPemCert(creds.credentialsValue ?? "");
        } else if (creds.credentialsType === "MQTT_BASIC") {
            try {
                const parsed: MqttBasicValue = JSON.parse(creds.credentialsValue ?? "{}");
                setMqttClientId(parsed.clientId ?? "");
                setMqttUsername(parsed.userName ?? "");
                setMqttPassword(parsed.password ?? "");
            } catch {
                setMqttClientId("");
                setMqttUsername("");
                setMqttPassword("");
            }
        }
    };

    // ── Reset on type change ─────────────────────────────────────────────────────

    const handleTypeChange = useCallback(
        (type: CredentialsType) => {
            setCredType(type);
            // If this type matches the server credential, restore; otherwise clear
            if (serverCreds?.credentialsType === type) {
                applyCredentials(serverCreds);
            } else {
                setAccessToken("");
                setPemCert("");
                setMqttClientId("");
                setMqttUsername("");
                setMqttPassword("");
            }
        },
        [serverCreds]
    );

    // ── Save ──────────────────────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!serverCreds) return;

        // Validation
        if (credType === "ACCESS_TOKEN" && !accessToken.trim()) {
            toast.error("Access token is required");
            return;
        }
        if (credType === "MQTT_BASIC" && !mqttUsername.trim()) {
            toast.error("Username is required");
            return;
        }

        setIsSaving(true);
        try {
            let payload: any = {
                id: serverCreds.id,
                createdTime: serverCreds.createdTime,
                deviceId: serverCreds.deviceId,
                version: serverCreds.version,
                credentialsType: credType,
                credentialsId: null,
                credentialsValue: null,
            };

            if (credType === "ACCESS_TOKEN") {
                payload.credentialsId = accessToken.trim();
            } else if (credType === "X509_CERTIFICATE") {
                payload.credentialsValue = pemCert;
            } else if (credType === "MQTT_BASIC") {
                const mqttValue: MqttBasicValue = {
                    clientId: mqttClientId.trim() || null,
                    userName: mqttUsername.trim(),
                    password: mqttPassword.trim() || null,
                };
                payload.credentialsValue = JSON.stringify(mqttValue);
            }

            await DeviceService.saveDeviceCredentials(payload);
            toast.success("Credentials saved successfully");
            onSuccess?.();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to save credentials");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (!isSaving) onOpenChange(false);
    };

    // ── Render ────────────────────────────────────────────────────────────────────

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Device Credentials</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading credentials…</span>
                    </div>
                ) : (
                    <div className="space-y-5 py-2">
                        {/* Type selector */}
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                                Credentials type
                            </Label>
                            <div className="flex bg-muted rounded-lg p-1 gap-1">
                                {CREDENTIAL_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleTypeChange(type)}
                                        className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${credType === type
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {CREDENTIAL_TYPE_LABELS[type]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Access Token ─────────────────────────────────────── */}
                        {credType === "ACCESS_TOKEN" && (
                            <TokenField
                                label="Access token"
                                required
                                value={accessToken}
                                onChange={setAccessToken}
                                placeholder="Enter or generate token"
                            />
                        )}

                        {/* ── X.509 ────────────────────────────────────────────── */}
                        {credType === "X509_CERTIFICATE" && (
                            <div className="space-y-1.5">
                                <Label>RSA public key (PEM format)</Label>
                                <Textarea
                                    value={pemCert}
                                    onChange={(e) => setPemCert(e.target.value)}
                                    placeholder={`-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----`}
                                    className="font-mono text-xs min-h-[180px] resize-y"
                                />
                            </div>
                        )}

                        {/* ── MQTT Basic ───────────────────────────────────────── */}
                        {credType === "MQTT_BASIC" && (
                            <div className="space-y-3">
                                <TokenField
                                    label="Client ID"
                                    value={mqttClientId}
                                    onChange={setMqttClientId}
                                    placeholder="Auto-generated if empty"
                                />
                                <TokenField
                                    label="User name"
                                    required
                                    value={mqttUsername}
                                    onChange={setMqttUsername}
                                    placeholder="Enter username"
                                />
                                <TokenField
                                    label="Password"
                                    value={mqttPassword}
                                    onChange={setMqttPassword}
                                    placeholder="Leave empty for no password"
                                />
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="pt-2">
                    <Button variant="ghost" onClick={handleClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading || isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
