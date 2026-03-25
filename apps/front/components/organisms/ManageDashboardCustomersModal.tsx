"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { CustomerMultiSelect, Customer } from "@/components/molecules/CustomerMultiSelect";
import { DashboardService } from "@/lib/services/thingsboardServices/dashboardService";
import { Dashboard } from "@/types/dashboardTypes";
import { toast } from "sonner";

interface ManageDashboardCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboard: Dashboard | null;
  onSuccess: () => void;
}

export function ManageDashboardCustomersModal({
  isOpen,
  onClose,
  dashboard,
  onSuccess,
}: ManageDashboardCustomersModalProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && dashboard) {
      loadInitialCustomers();
    } else {
      setSelectedCustomers([]);
    }
  }, [isOpen, dashboard]);

  const loadInitialCustomers = async () => {
    if (!dashboard?.assignedCustomers?.length) {
      setSelectedCustomers([]);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch full customer info for each assigned customer to display in the labels
      const customers = await Promise.all(
        dashboard.assignedCustomers.map(async (ac) => {
          try {
            return await DashboardService.getCustomerById(ac.customerId.id);
          } catch (e) {
            // Fallback to minimal info if fetch fails
            return {
              id: ac.customerId,
              title: ac.title || "Unknown Customer",
            };
          }
        })
      );
      setSelectedCustomers(customers);
    } catch (error) {
      console.error("Failed to load assigned customers", error);
      toast.error("Failed to load assigned customers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!dashboard) return;

    setIsUpdating(true);
    try {
      const customerIds = selectedCustomers.map((c) => c.id.id);
      await DashboardService.updateDashboardCustomers(dashboard.id.id, customerIds);
      toast.success("Dashboard customers updated");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update dashboard customers", error);
      toast.error("Failed to update dashboard customers");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!dashboard) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] w-auto p-0 dark:bg-[#202E3C] border-slate-700 overflow-hidden outline-none">
        <DialogHeader className="bg-[#2A456C] h-14 flex flex-row items-center justify-between px-6 py-2 relative">
          <DialogTitle className="text-[20px] text-white font-medium">
            Manage assigned customers
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-6 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <div className="p-8 space-y-2 dark:text-gray-200 min-h-[200px]">
          <label className="text-sm text-gray-500 dark:text-gray-400">
            Assigned customers
          </label>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <CustomerMultiSelect
              selectedCustomers={selectedCustomers}
              onCustomersChange={setSelectedCustomers}
              placeholder="Entity list"
            />
          )}
        </div>

        <DialogFooter className="p-6 bg-gray-50 dark:bg-transparent border-t dark:border-slate-700 flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="ghost"
            disabled={isUpdating}
            className="bg-[#E9EEF5] text-[#2A6B97] hover:bg-[#D9E2ED] dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 font-medium h-10 px-6 rounded"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || isLoading}
            className="bg-[#E0E0E0] text-gray-700 dark:bg-slate-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600 font-medium h-10 px-6 rounded shadow-none border-none"
          >
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
