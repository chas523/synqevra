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

export function OAuth2ClientForm({
  initialData,
  isSaving,
  onSave,
  onCancel,
  templates,
}: OAuth2ClientFormProps) {
  const defaultGoogleTemplate = templates.find(
    (t) => t.providerId === "Google",
  );

  const [activeTab, setActiveTab] = useState<"general" | "mapper">("general");

  // General fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [provider, setProvider] = useState(
    initialData?.additionalInfo?.providerName || "Google",
  );
  const [platforms, setPlatforms] = useState<string[]>(
    initialData?.platforms || ["WEB", "ANDROID", "IOS"],
  );
  const [clientId, setClientId] = useState(initialData?.clientId || "");
  const [clientSecret, setClientSecret] = useState(
    initialData?.clientSecret || "",
  );
  const [showSecret, setShowSecret] = useState(false);

  // Advanced General
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [accessTokenUri, setAccessTokenUri] = useState(
    initialData?.accessTokenUri ||
      defaultGoogleTemplate?.accessTokenUri ||
      "https://oauth2.googleapis.com/token",
  );
  const [authorizationUri, setAuthorizationUri] = useState(
    initialData?.authorizationUri ||
      defaultGoogleTemplate?.authorizationUri ||
      "https://accounts.google.com/o/oauth2/v2/auth",
  );
  const [jwkSetUri, setJwkSetUri] = useState(
    initialData?.jwkSetUri ||
      defaultGoogleTemplate?.jwkSetUri ||
      "https://www.googleapis.com/oauth2/v3/certs",
  );
  const [userInfoUri, setUserInfoUri] = useState(
    initialData?.userInfoUri ||
      defaultGoogleTemplate?.userInfoUri ||
      "https://openidconnect.googleapis.com/v1/userinfo",
  );
  const [clientAuthMethod, setClientAuthMethod] = useState(
    initialData?.clientAuthenticationMethod ||
      defaultGoogleTemplate?.clientAuthenticationMethod ||
      "BASIC",
  );

  const [allowUserCreation, setAllowUserCreation] = useState(
    initialData?.mapperConfig?.allowUserCreation ??
      defaultGoogleTemplate?.mapperConfig?.allowUserCreation ??
      true,
  );
  const [activateUser, setActivateUser] = useState(
    initialData?.mapperConfig?.activateUser ??
      defaultGoogleTemplate?.mapperConfig?.activateUser ??
      false,
  );

  const initialScope = initialData?.scope ||
    defaultGoogleTemplate?.scope || ["email", "openid", "profile"];
  const [scopeItems, setScopeItems] = useState<string[]>(initialScope);
  const [newScope, setNewScope] = useState("");

  // Mapper fields
  const mapperBasic =
    initialData?.mapperConfig?.basic ||
    defaultGoogleTemplate?.mapperConfig?.basic ||
    {};
  const [userNameAttr, setUserNameAttr] = useState(
    initialData?.userNameAttributeName ||
      defaultGoogleTemplate?.userNameAttributeName ||
      "email",
  );
  const [mapperType, setMapperType] = useState(
    initialData?.mapperConfig?.type ||
      defaultGoogleTemplate?.mapperConfig?.type ||
      "BASIC",
  );
  const [emailAttr, setEmailAttr] = useState(
    mapperBasic.emailAttributeKey || "email",
  );
  const [firstNameAttr, setFirstNameAttr] = useState(
    mapperBasic.firstNameAttributeKey || "given_name",
  );
  const [lastNameAttr, setLastNameAttr] = useState(
    mapperBasic.lastNameAttributeKey || "family_name",
  );
  const [tenantNameStrategy, setTenantNameStrategy] = useState(
    mapperBasic.tenantNameStrategy || "DOMAIN",
  );
  const [customerNamePattern, setCustomerNamePattern] = useState(
    mapperBasic.customerNamePattern || "",
  );
  const [defaultDashboard, setDefaultDashboard] = useState(
    mapperBasic.defaultDashboardName || "",
  );
  const [alwaysFullscreen, setAlwaysFullscreen] = useState(
    mapperBasic.alwaysFullScreen || false,
  );

  // Platform dropdown helper
  const availablePlatforms = [
    { label: "Web", value: "WEB" },
    { label: "Android", value: "ANDROID" },
    { label: "iOS", value: "IOS" },
  ];

  const togglePlatform = (val: string) => {
    if (platforms.includes(val))
      setPlatforms(platforms.filter((p) => p !== val));
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
      toast.error(
        "Please fill required fields (Title, Client ID, Client Secret)",
      );
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
        },
      },
    };

    if (initialData?.id) {
      payload.id = initialData.id;
    }

    onSave(payload);
  };

  return (
    <div className="flex flex-col h-full bg-background dark:bg-slate-900 overflow-hidden">
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Title & Provider */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground dark:text-slate-400">
              Title*
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving}
              placeholder="e.g. Google Login"
              className="bg-muted dark:bg-slate-800/50 border-border dark:border-slate-700 dark:text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground dark:text-slate-400">
              Provider*
            </label>
            <Select
              value={provider}
              onValueChange={setProvider}
              disabled={isSaving}
            >
              <SelectTrigger className="bg-muted dark:bg-slate-800/50 border-border dark:border-slate-700 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Google">Google</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Client ID & Secret */}
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground dark:text-slate-400">
              Client ID*
            </label>
            <Input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={isSaving}
              placeholder="Enter Google Client ID"
              className="bg-muted dark:bg-slate-800/50 border-border dark:border-slate-700 dark:text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground dark:text-slate-400">
              Client secret*
            </label>
            <div className="relative flex items-center">
              <Input
                type={showSecret ? "text" : "password"}
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                disabled={isSaving}
                placeholder="Enter Google Client Secret"
                className="bg-muted dark:bg-slate-800/50 border-border dark:border-slate-700 dark:text-white pr-9"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2.5 text-muted-foreground hover:text-foreground dark:hover:text-slate-200"
              >
                {showSecret ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border dark:border-slate-800 bg-muted/50 dark:bg-slate-900/40 flex justify-end gap-2 shrink-0">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isSaving}
          className="dark:text-slate-300 dark:hover:text-white"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={
            isSaving ||
            !title.trim() ||
            !clientId.trim() ||
            !clientSecret.trim()
          }
          className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-18"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : initialData ? (
            "Save"
          ) : (
            "Add"
          )}
        </Button>
      </div>
    </div>
  );
}
