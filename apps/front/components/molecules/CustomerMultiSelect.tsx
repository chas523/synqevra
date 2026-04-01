"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Loader2, Check } from "lucide-react";
import { DashboardService } from "@/lib/services/thingsboardServices/dashboardService";
import { EntityId } from "@/types/dashboardTypes";

export interface Customer {
  id: EntityId;
  title: string;
  name?: string;
  additionalInfo?: {
    isPublic?: boolean;
  };
}

interface CustomerMultiSelectProps {
  selectedCustomers: Customer[];
  onCustomersChange: (customers: Customer[]) => void;
  placeholder?: string;
}

export function CustomerMultiSelect({
  selectedCustomers,
  onCustomersChange,
  placeholder = "Entity list",
}: CustomerMultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search customers when term changes or when dropdown opens
  const searchCustomers = useCallback(async (textSearch: string) => {
    setIsSearching(true);
    try {
      const response = await DashboardService.getCustomers(
        100,
        0,
        "title",
        "ASC",
        textSearch,
      );
      setSearchResults(response.data || []);
    } catch (error) {
      console.error("Failed to search customers", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (showResults) {
       const timer = setTimeout(() => {
         searchCustomers(searchTerm);
       }, 300);
       return () => clearTimeout(timer);
    }
  }, [searchTerm, showResults, searchCustomers]);

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

  const toggleCustomer = (customer: Customer, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isAlreadySelected = selectedCustomers.some((c) => c.id.id === customer.id.id);
    
    if (isAlreadySelected) {
      onCustomersChange(selectedCustomers.filter((c) => c.id.id !== customer.id.id));
    } else {
      onCustomersChange([...selectedCustomers, customer]);
    }
    // Don't close results, allow multi-select like in CreateVersionModal
  };

  const removeCustomer = (customerId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCustomersChange(selectedCustomers.filter((c) => c.id.id !== customerId));
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      {/* Search Input and Badges Container */}
      <div 
        className="flex flex-wrap items-center gap-1.5 p-1.5 min-h-[40px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded cursor-text focus-within:ring-1 focus-within:ring-orange-500 transition-all duration-200"
        onClick={() => setShowResults(true)}
      >
        {selectedCustomers.map((customer) => (
          <span 
            key={customer.id.id} 
            className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs text-slate-700 dark:text-white font-normal"
          >
            {customer.title || customer.name}
            <button
              type="button"
              onClick={(e) => removeCustomer(customer.id.id, e)}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 ml-1 leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="flex-1 bg-transparent outline-none border-none shadow-none focus:ring-0 text-slate-800 dark:text-gray-200 placeholder-slate-400 text-sm py-0.5"
          placeholder={selectedCustomers.length === 0 ? placeholder : ""}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
        />
      </div>

      {showResults && (
        <>
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded shadow-lg max-h-60 overflow-y-auto py-1">
            {isSearching && searchResults.length === 0 ? (
              <div className="px-4 py-3 text-xs text-center text-slate-500 dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                Loading customers...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((customer) => {
                const isSelected = selectedCustomers.some((c) => c.id.id === customer.id.id);
                return (
                  <div
                    key={customer.id.id}
                    className={`w-full text-left px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between dark:text-slate-200 ${isSelected ? "bg-slate-50 dark:bg-slate-700/50 font-medium" : ""}`}
                    onClick={(e) => toggleCustomer(customer, e)}
                  >
                    <span>{customer.title || customer.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-orange-500" />}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-center text-slate-500 dark:text-gray-400">
                No customers found
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
