"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { TenantService } from "@/lib/services/adminServices/tenantService";
import { Tenant } from "@/lib/types/dashboardTypes";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface TenantMultiSelectProps {
  selectedTenants: Tenant[];
  onTenantsChange: (tenants: Tenant[]) => void;
  label?: string;
  placeholder?: string;
  hint?: string;
}

export function TenantMultiSelect({
  selectedTenants,
  onTenantsChange,
  label = "Tenants",
  placeholder = "Select tenants...",
  hint,
}: TenantMultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Tenant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchTenants(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchTenants = async (textSearch: string) => {
    setIsSearching(true);
    try {
      const response = await TenantService.getTenants({
        limit: 10,
        textSearch,
      });
      // Filter out already selected tenants
      const filtered = response.data.filter(
        (t) => !selectedTenants.some((st) => st.id.id === t.id.id),
      );
      setSearchResults(filtered);
      setShowResults(true);
    } catch (error) {
      console.error("Failed to search tenants", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTenant = (tenant: Tenant) => {
    onTenantsChange([...selectedTenants, tenant]);
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleRemoveTenant = (tenantId: string) => {
    onTenantsChange(selectedTenants.filter((t) => t.id.id !== tenantId));
  };

  return (
    <div className="space-y-2 relative" ref={searchRef}>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-background">
        {selectedTenants.map((tenant) => (
          <Badge key={tenant.id.id} variant="secondary" className="gap-1 pr-1">
            {tenant.title || tenant.name}
            <button
              type="button"
              onClick={() => handleRemoveTenant(tenant.id.id)}
              className="hover:bg-muted rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </button>
          </Badge>
        ))}
        <input
          className="flex-1 bg-transparent outline-none min-w-[120px] text-sm"
          placeholder={selectedTenants.length === 0 ? placeholder : ""}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (searchTerm) setShowResults(true);
          }}
        />
      </div>

      {/* Hint text */}
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}

      {/* Dropdown Results */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover text-popover-foreground border rounded-md shadow-md max-h-[200px] overflow-auto py-1">
          {searchResults.map((tenant) => (
            <button
              key={tenant.id.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between group"
              onClick={() => handleSelectTenant(tenant)}
            >
              <span>{tenant.title || tenant.name}</span>
            </button>
          ))}
        </div>
      )}
      {showResults && isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-2 text-center text-sm text-muted-foreground">
          Searching...
        </div>
      )}
      {showResults &&
        !isSearching &&
        searchResults.length === 0 &&
        searchTerm && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border rounded-md shadow-md p-2 text-center text-sm text-muted-foreground">
            No tenants found
          </div>
        )}
    </div>
  );
}
