"use client";

import { useState, useEffect } from "react";
import { Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    SelectAdmin as Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/admin_select";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

// Types derived from backend expected payload and response
export interface OAuth2ClientPayload {
    title: string;
    additionalInfo: { providerName: string };
    platforms: string[];
    clientId: string;
    clientSecret: string;
    accessTokenUri: string;
    authorizationUri: string;
    jwkSetUri: string;
    userInfoUri: string;
    clientAuthenticationMethod: string;
    loginButtonLabel: string;
    loginButtonIcon: string;
    userNameAttributeName: string;
    scope: string[];
    mapperConfig: {
        allowUserCreation: boolean;
        activateUser: boolean;
        type: string;
        basic: {
            emailAttributeKey?: string;
            firstNameAttributeKey?: string;
            lastNameAttributeKey?: string;
            tenantNameStrategy: string;
            customerNamePattern: string | null;
            defaultDashboardName: string | null;
            alwaysFullScreen: boolean;
        };
    };
    id?: { entityType: "OAUTH2_CLIENT"; id: string };
}

interface OAuth2ClientFormProps {
    initialData?: OAuth2ClientPayload | null;
    isSaving: boolean;
    onSave: (payload: OAuth2ClientPayload) => void;
    onCancel: () => void;
    templates: any[];
}

export function OAuth2ClientForm({ initialData, isSaving, onSave, onCancel, templates }: OAuth2ClientFormProps) {
    const defaultGoogleTemplate = templates.find((t) => t.providerId === "Google");

    const [activeTab, setActiveTab] = useState<"general" | "mapper">("general");

    // General fields
    const [title, setTitle] = useState(initialData?.title || "");
    const [provider, setProvider] = useState(initialData?.additionalInfo?.providerName || "Google");
    const [platforms, setPlatforms] = useState<string[]>(initialData?.platforms || ["WEB", "ANDROID", "IOS"]);
    const [clientId, setClientId] = useState(initialData?.clientId || "");
    const [clientSecret, setClientSecret] = useState(initialData?.clientSecret || "");
    const [showSecret, setShowSecret] = useState(false);

    // Advanced General 
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [accessTokenUri, setAccessTokenUri] = useState(initialData?.accessTokenUri || defaultGoogleTemplate?.accessTokenUri || "https://oauth2.googleapis.com/token");
    const [authorizationUri, setAuthorizationUri] = useState(initialData?.authorizationUri || defaultGoogleTemplate?.authorizationUri || "https://accounts.google.com/o/oauth2/v2/auth");
    const [jwkSetUri, setJwkSetUri] = useState(initialData?.jwkSetUri || defaultGoogleTemplate?.jwkSetUri || "https://www.googleapis.com/oauth2/v3/certs");
    const [userInfoUri, setUserInfoUri] = useState(initialData?.userInfoUri || defaultGoogleTemplate?.userInfoUri || "https://openidconnect.googleapis.com/v1/userinfo");
    const [clientAuthMethod, setClientAuthMethod] = useState(initialData?.clientAuthenticationMethod || defaultGoogleTemplate?.clientAuthenticationMethod || "BASIC");

    const [allowUserCreation, setAllowUserCreation] = useState(initialData?.mapperConfig?.allowUserCreation ?? defaultGoogleTemplate?.mapperConfig?.allowUserCreation ?? true);
    const [activateUser, setActivateUser] = useState(initialData?.mapperConfig?.activateUser ?? defaultGoogleTemplate?.mapperConfig?.activateUser ?? false);

    const initialScope = initialData?.scope || defaultGoogleTemplate?.scope || ["email", "openid", "profile"];
    const [scopeItems, setScopeItems] = useState<string[]>(initialScope);
    const [newScope, setNewScope] = useState("");

    // Mapper fields
    const mapperBasic = initialData?.mapperConfig?.basic || defaultGoogleTemplate?.mapperConfig?.basic || {};
    const [userNameAttr, setUserNameAttr] = useState(initialData?.userNameAttributeName || defaultGoogleTemplate?.userNameAttributeName || "email");
    const [mapperType, setMapperType] = useState(initialData?.mapperConfig?.type || defaultGoogleTemplate?.mapperConfig?.type || "BASIC");
    const [emailAttr, setEmailAttr] = useState(mapperBasic.emailAttributeKey || "email");
    const [firstNameAttr, setFirstNameAttr] = useState(mapperBasic.firstNameAttributeKey || "given_name");
    const [lastNameAttr, setLastNameAttr] = useState(mapperBasic.lastNameAttributeKey || "family_name");
    const [tenantNameStrategy, setTenantNameStrategy] = useState(mapperBasic.tenantNameStrategy || "DOMAIN");
    const [customerNamePattern, setCustomerNamePattern] = useState(mapperBasic.customerNamePattern || "");
    const [defaultDashboard, setDefaultDashboard] = useState(mapperBasic.defaultDashboardName || "");
    const [alwaysFullscreen, setAlwaysFullscreen] = useState(mapperBasic.alwaysFullScreen || false);

    // Platform dropdown helper
    const availablePlatforms = [
        { label: "Web", value: "WEB" },
        { label: "Android", value: "ANDROID" },
        { label: "iOS", value: "IOS" },
    ];

    const togglePlatform = (val: string) => {
        if (platforms.includes(val)) setPlatforms(platforms.filter((p) => p !== val));
        else setPlatforms([...platforms, val]);
    };

    const addScope = () => {
        if (newScope.trim() && !scopeItems.includes(newScope.trim())) {
            setScopeItems([...scopeItems, newScope.trim()]);
            setNewScope("");
        }
    };

    const handleSave = () => {
        if (!title.trim() || !clientId.trim() || !clientSecret.trim()) {
            toast.error("Please fill required fields (Title, Client ID, Client Secret)");
            return;
        }

        const payload: OAuth2ClientPayload = {
            title: title.trim(),
            additionalInfo: { providerName: provider },
            platforms,
            clientId: clientId.trim(),
            clientSecret: clientSecret.trim(),
            accessTokenUri: accessTokenUri.trim(),
            authorizationUri: authorizationUri.trim(),
            jwkSetUri: jwkSetUri.trim(),
            userInfoUri: userInfoUri.trim(),
            clientAuthenticationMethod: clientAuthMethod,
            loginButtonLabel: provider,
            loginButtonIcon: provider === "Google" ? "google-logo" : "",
            userNameAttributeName: userNameAttr.trim(),
            scope: scopeItems,
            mapperConfig: {
                allowUserCreation,
                activateUser,
                type: mapperType,
                basic: {
                    emailAttributeKey: emailAttr.trim(),
                    firstNameAttributeKey: firstNameAttr.trim(),
                    lastNameAttributeKey: lastNameAttr.trim(),
                    tenantNameStrategy,
                    customerNamePattern: customerNamePattern.trim() || null,
                    defaultDashboardName: defaultDashboard.trim() || null,
                    alwaysFullScreen: alwaysFullscreen,
                }
            }
        };

        if (initialData?.id) {
            payload.id = initialData.id;
        }

        onSave(payload);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* Title */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Title*</label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isSaving}
                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:text-white"
                    />
                </div>

                {/* Provider & Platforms */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Provider*</label>
                        <Select value={provider} onValueChange={setProvider} disabled={isSaving}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Google">Google</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Allowed platforms</label>

                        {/* Custom multi-select dropdown for platforms */}
                        <div className="relative group">
                            <div className="flex items-center justify-between px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800/50 cursor-pointer text-slate-700 dark:text-slate-200">
                                <span className="truncate">
                                    {platforms.length === 3 ? "All platforms" : platforms.length > 0 ? platforms.map(p => p === "IOS" ? "iOS" : p.charAt(0) + p.slice(1).toLowerCase()).join(", ") : "None"}
                                </span>
                                <ChevronDown className="w-4 h-4 opacity-50" />
                            </div>
                            <div className="absolute top-full left-0 z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg hidden group-hover:block">
                                {availablePlatforms.map(p => (
                                    <div key={p.value} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer" onClick={() => !isSaving && togglePlatform(p.value)}>
                                        <input type="checkbox" checked={platforms.includes(p.value)} readOnly className="rounded border-slate-300 dark:border-slate-600 outline-none" />
                                        <span className="text-sm dark:text-slate-200">{p.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Client ID & Secret */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Client ID*</label>
                        <Input
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            disabled={isSaving}
                            className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:text-white"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Client secret*</label>
                        <div className="relative flex items-center">
                            <Input
                                type={showSecret ? "text" : "password"}
                                value={clientSecret}
                                onChange={(e) => setClientSecret(e.target.value)}
                                disabled={isSaving}
                                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:text-white pr-9"
                            />
                            <button
                                type="button"
                                onClick={() => setShowSecret(!showSecret)}
                                className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Advanced settings collapsible */}
                <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30 font-medium text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors dark:text-white">
                            Advanced settings
                            <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">

                            {/* Inner Tabs for Advanced */}
                            <div className="flex justify-end mb-4">
                                <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full text-xs font-medium">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("general")}
                                        className={`px-3 py-1 rounded-full transition-colors ${activeTab === 'general' ? 'bg-[#2a456c] dark:bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                                    >General</button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("mapper")}
                                        className={`px-3 py-1 rounded-full transition-colors ${activeTab === 'mapper' ? 'bg-[#2a456c] dark:bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                                    >Mapper</button>
                                </div>
                            </div>

                            {activeTab === "general" && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Access token URI*</label>
                                            <Input value={accessTokenUri} onChange={(e) => setAccessTokenUri(e.target.value)} disabled={isSaving} className="bg-slate-50 dark:bg-slate-800/50 text-xs dark:text-white border-slate-200 dark:border-slate-700" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Authorization URI*</label>
                                            <Input value={authorizationUri} onChange={(e) => setAuthorizationUri(e.target.value)} disabled={isSaving} className="bg-slate-50 dark:bg-slate-800/50 text-xs dark:text-white border-slate-200 dark:border-slate-700" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">JSON Web Key URI</label>
                                            <Input value={jwkSetUri} onChange={(e) => setJwkSetUri(e.target.value)} disabled={isSaving} className="bg-slate-50 dark:bg-slate-800/50 text-xs dark:text-white border-slate-200 dark:border-slate-700" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">User info URI</label>
                                            <Input value={userInfoUri} onChange={(e) => setUserInfoUri(e.target.value)} disabled={isSaving} className="bg-slate-50 dark:bg-slate-800/50 text-xs dark:text-white border-slate-200 dark:border-slate-700" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Client authentication method*</label>
                                        <Select value={clientAuthMethod} onValueChange={setClientAuthMethod} disabled={isSaving}>
                                            <SelectTrigger className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BASIC">BASIC</SelectItem>
                                                <SelectItem value="NONE">NONE</SelectItem>
                                                <SelectItem value="POST">POST</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Switch checked={allowUserCreation} onCheckedChange={setAllowUserCreation} disabled={isSaving} className="data-[state=checked]:bg-orange-500" />
                                        <span className="text-sm font-medium dark:text-white">Allow user creation</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Switch checked={activateUser} onCheckedChange={setActivateUser} disabled={isSaving} />
                                        <span className="text-sm font-medium dark:text-white">Activate user</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Scope*</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {scopeItems.map((s, idx) => (
                                                <span key={idx} className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs dark:text-white">
                                                    {s}
                                                    <button type="button" onClick={() => setScopeItems(scopeItems.filter(i => i !== s))} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 ml-0.5">×</button>
                                                </span>
                                            ))}
                                            <input
                                                value={newScope}
                                                onChange={e => setNewScope(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addScope())}
                                                onBlur={addScope}
                                                placeholder={scopeItems.length === 0 ? "Add scope..." : ""}
                                                className="bg-transparent text-sm outline-none px-1 min-w-[80px] dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "mapper" && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">User name attribute key*</label>
                                        <Input value={userNameAttr} onChange={(e) => setUserNameAttr(e.target.value)} disabled={isSaving} className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:text-white" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Mapper type*</label>
                                        <Input value={mapperType} readOnly className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email attribute key*</label>
                                        <Input value={emailAttr} onChange={(e) => setEmailAttr(e.target.value)} disabled={isSaving} className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:text-white" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">First name attribute key</label>
                                            <Input value={firstNameAttr} onChange={(e) => setFirstNameAttr(e.target.value)} disabled={isSaving} className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:text-white" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Last name attribute key</label>
                                            <Input value={lastNameAttr} onChange={(e) => setLastNameAttr(e.target.value)} disabled={isSaving} className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Tenant name strategy</label>
                                        <Select value={tenantNameStrategy} onValueChange={setTenantNameStrategy} disabled={isSaving}>
                                            <SelectTrigger className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DOMAIN">DOMAIN</SelectItem>
                                                <SelectItem value="EMAIL">EMAIL</SelectItem>
                                                <SelectItem value="CUSTOM">CUSTOM</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Customer name pattern</label>
                                        <Input value={customerNamePattern} onChange={(e) => setCustomerNamePattern(e.target.value)} disabled={isSaving} className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:text-white" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 space-y-1.5">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Default dashboard name</label>
                                            <Input value={defaultDashboard} onChange={(e) => setDefaultDashboard(e.target.value)} disabled={isSaving} className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:text-white" />
                                        </div>
                                        <div className="flex items-center gap-3 pt-5">
                                            <Switch checked={alwaysFullscreen} onCheckedChange={setAlwaysFullscreen} disabled={isSaving} />
                                            <span className="text-sm font-medium dark:text-white">Always fullscreen</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex justify-end gap-2 shrink-0">
                <Button variant="ghost" onClick={onCancel} disabled={isSaving} className="dark:text-slate-300 dark:hover:text-white">
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || !title.trim() || !clientId.trim() || !clientSecret.trim()}
                    className="bg-[#2a456c] hover:bg-[#1a355c] text-white min-w-[72px]"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : initialData ? "Save" : "Add"}
                </Button>
            </div>
        </div>
    );
}
