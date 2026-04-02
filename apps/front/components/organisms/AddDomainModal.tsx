"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  OAuth2Service,
  OAuth2ClientInfo,
  CreateDomainPayload,
} from "@/lib/services/thingsboardServices/oauth2Service";

// ─── OAuth2 Client Multi-Select ─────────────────────────────────────────────
function OAuth2ClientMultiSelect({
  selectedIds,
  selectedCache,
  onChange,
  onCacheUpdate,
  disabled,
}: {
  selectedIds: string[];
  selectedCache: Record<string, OAuth2ClientInfo>;
  onChange: (ids: string[]) => void;
  onCacheUpdate: (cache: Record<string, OAuth2ClientInfo>) => void;
  disabled: boolean;
}) {
  const [clients, setClients] = useState<OAuth2ClientInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadClients = async () => {
    if (clients.length > 0) return;
    setIsLoading(true);
    try {
      const result = await OAuth2Service.getOAuth2ClientInfos();
      setClients(result.data ?? []);
    } catch {
      toast.error("Failed to fetch OAuth2 clients");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleId = (client: OAuth2ClientInfo, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const id = client.id.id;
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onChange(newIds);

    const newCache = { ...selectedCache };
    if (selectedIds.includes(id)) {
      delete newCache[id];
    } else {
      newCache[id] = client;
    }
    onCacheUpdate(newCache);
  };

  const removeId = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(selectedIds.filter((x) => x !== id));
    const newCache = { ...selectedCache };
    delete newCache[id];
    onCacheUpdate(newCache);
  };

  const filtered = clients.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger / tags */}
      <div
        className={`flex flex-wrap gap-1.5 p-2 min-h-10.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg cursor-text transition-colors ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        onClick={() => {
          setIsOpen(true);
          loadClients();
        }}
      >
        {selectedIds.map((id) => {
          const client =
            selectedCache[id] || clients.find((c) => c.id.id === id);
          return (
            <span
              key={id}
              className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs dark:text-white"
            >
              {client?.title || id.substring(0, 8)}
              <button
                type="button"
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 ml-0.5"
                onClick={(e) => removeId(id, e)}
              >
                ×
              </button>
            </span>
          );
        })}
        <input
          type="text"
          className="flex-1 min-w-35 bg-transparent outline-none text-sm px-1 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          placeholder={selectedIds.length === 0 ? "Add OAuth 2.0 client" : ""}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => {
            setIsOpen(true);
            loadClients();
          }}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="py-4 text-sm text-center text-slate-400 dark:text-slate-500">
              No clients found
            </div>
          )}
          {!isLoading && filtered.length > 0 && (
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 flex justify-between">
              <span>
                List of {filtered.length}{" "}
                {filtered.length === 1 ? "client" : "clients"}
              </span>
            </div>
          )}
          {filtered.map((client) => {
            const isSelected = selectedIds.includes(client.id.id);
            return (
              <div
                key={client.id.id}
                className={`px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${isSelected ? "bg-slate-50 dark:bg-slate-700/40" : ""}`}
                onClick={(e) => toggleId(client, e)}
              >
                <span>{client.title}</span>
                {isSelected && (
                  <span className="text-[#2a456c] dark:text-blue-400 font-medium">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Add Domain Modal ────────────────────────────────────────────────────────
export interface AddDomainModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddDomainModal({
  open,
  onOpenChange,
  onSuccess,
}: AddDomainModalProps) {
  const [name, setName] = useState("");
  const [oauth2Enabled, setOauth2Enabled] = useState(true);
  const [propagateToEdge, setPropagateToEdge] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [selectedClientCache, setSelectedClientCache] = useState<
    Record<string, OAuth2ClientInfo>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setName("");
      setOauth2Enabled(true);
      setPropagateToEdge(false);
      setSelectedClientIds([]);
      setSelectedClientCache({});
      setIsSaving(false);
    }
  }, [open]);

  const redirectUri = name ? `${name}/login/oauth2/code/` : "";

  const handleCopy = () => {
    if (redirectUri) {
      navigator.clipboard.writeText(redirectUri);
      toast.success("Copied to clipboard");
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error("Domain name is required");
      return;
    }
    setIsSaving(true);
    try {
      const payload: CreateDomainPayload = {
        name: name.trim(),
        oauth2Enabled,
        propagateToEdge,
      };
      await OAuth2Service.createDomain(payload, selectedClientIds);
      toast.success("Domain created successfully");
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Failed to create domain");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSaving && onOpenChange(val)}>
      <DialogContent className="sm:max-w-125 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
          <DialogTitle className="text-lg font-semibold dark:text-white">
            Add domain
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          {/* Domain name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Domain name*
            </label>
            <Input
              placeholder="localhost"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Redirect URI (read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Redirect URI template
            </label>
            <div className="relative flex items-center">
              <Input
                readOnly
                value={redirectUri}
                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:text-slate-300 pr-10"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Copy"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Enable OAuth 2.0 */}
          <div className="flex items-center gap-3 py-1">
            <Switch
              checked={oauth2Enabled}
              onCheckedChange={setOauth2Enabled}
              disabled={isSaving}
              className="data-[state=checked]:bg-orange-500"
            />
            <span className="text-sm font-medium dark:text-white">
              Enable OAuth 2.0 settings
            </span>
          </div>

          {/* OAuth 2.0 clients */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              OAuth 2.0 clients
            </label>
            <OAuth2ClientMultiSelect
              selectedIds={selectedClientIds}
              selectedCache={selectedClientCache}
              onChange={setSelectedClientIds}
              onCacheUpdate={setSelectedClientCache}
              disabled={isSaving}
            />
          </div>

          {/* Propagate to Edge */}
          <div className="flex items-center gap-3 py-1">
            <Switch
              checked={propagateToEdge}
              onCheckedChange={setPropagateToEdge}
              disabled={isSaving}
            />
            <span className="text-sm font-medium dark:text-white">
              Propagate to Edge
            </span>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="dark:text-slate-300 dark:hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={isSaving || !name.trim()}
            className="bg-[#2a456c] hover:bg-[#1a355c] text-white min-w-18"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
