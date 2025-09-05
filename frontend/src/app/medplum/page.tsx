"use client";

import { useEffect, useState } from "react";
import { Customer, Device } from "../../lib/utils";
import { fetchCustomers, fetchDevices } from "./actions";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { DeviceTable } from "./components/deviceTable";
import { CustomerTable } from "./components/customerTable";

type TabValue = "devices" | "customers";

export default function MedplumPage() {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [devicesSearchQuery, setDevicesSearchQuery] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [customersSearchQuery, setCustomersSearchQuery] = useState("");

  const [activeTab, setActiveTab] = useState<TabValue>("devices");
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "ascending",
  });

  const [devicesPage, setDevicesPage] = useState(0);
  const [devicesTotalPages, setDevicesTotalPages] = useState(1);
  const [devicesTotalElements, setDevicesTotalElements] = useState(0);

  const [customersPage, setCustomersPage] = useState(0);
  const [customersTotalPages, setCustomersTotalPages] = useState(1);
  const [customersTotalElements, setCustomersTotalElements] = useState(0);

  const handleSort = (key: keyof Customer) => {
    let direction: "ascending" | "descending" = "ascending";

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    setSortConfig({ key, direction });

    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
      const aValue = a[key] || "";
      const bValue = b[key] || "";

      if (aValue < bValue) {
        return direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setFilteredCustomers(sortedCustomers);
  };

  const loadCustomers = async (page: number = 0) => {
    try {
      setLoading(true);
      const result = await fetchCustomers(page);

      if (result?.success) {
        const customersData = result.data.data || [];
        setCustomers(customersData);
        setFilteredCustomers(customersData);
        setCustomersTotalPages(result.data.totalPages || 1);
        setCustomersTotalElements(result.data.totalElements || 0);
        setCustomersPage(page);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!customersSearchQuery) {
      setFilteredCustomers(customers);
      return;
    }

    const query = customersSearchQuery.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        (customer.name && customer.name.toLowerCase().includes(query)) ||
        (customer.email && customer.email.toLowerCase().includes(query)) ||
        (customer.country && customer.country.toLowerCase().includes(query)) ||
        (customer.city && customer.city.toLowerCase().includes(query))
    );

    setFilteredCustomers(filtered);
  }, [customersSearchQuery, customers]);

  useEffect(() => {
    if (!devicesSearchQuery) {
      setFilteredDevices(devices);
      return;
    }

    const query = devicesSearchQuery.toLowerCase();
    const filtered = devices.filter(
      (device) =>
        (device.name && device.name.toLowerCase().includes(query)) ||
        (device.type && device.type.toLowerCase().includes(query)) ||
        (device.transportType &&
          device.transportType.toLowerCase().includes(query))
    );

    setFilteredDevices(filtered);
  }, [devicesSearchQuery, devices]);

  const loadDevices = async (page: number = 0) => {
    try {
      setLoading(true);
      const result = await fetchDevices(page);

      if (result?.success) {
        const devicesData = result.data.data || [];
        setDevices(devicesData);
        setFilteredDevices(devicesData);
        setDevicesTotalPages(result.data.totalPages || 1);
        setDevicesTotalElements(result.data.totalElements || 0);
        setDevicesPage(page);
      }
    } catch (err) {
      console.error("Failed to load devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices(0);
  }, []);

  useEffect(() => {
    loadCustomers(0);
  }, []);

  const handleDevicesPrevPage = () => {
    if (devicesPage > 0) {
      loadDevices(devicesPage - 1);
    }
  };

  const handleDevicesNextPage = () => {
    if (devicesPage < devicesTotalPages - 1) {
      loadDevices(devicesPage + 1);
    }
  };

  const handleCustomersPrevPage = () => {
    if (customersPage > 0) {
      loadCustomers(customersPage - 1);
    }
  };

  const handleCustomersNextPage = () => {
    if (customersPage < customersTotalPages - 1) {
      loadCustomers(customersPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-700">Loading data...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Medplum Dashboard
        </h1>
        <p className="text-gray-600">Manage your devices and customers</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabValue)}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger
            value="devices"
            className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Devices ({devices.length})
          </TabsTrigger>
          <TabsTrigger
            value="customers"
            className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Customers ({customers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices">
          <DeviceTable
            devices={devices}
            filteredDevices={filteredDevices}
            searchQuery={devicesSearchQuery}
            setSearchQuery={setDevicesSearchQuery}
            page={devicesPage}
            totalPages={devicesTotalPages}
            totalElements={devicesTotalElements}
            onPrevPage={handleDevicesPrevPage}
            onNextPage={handleDevicesNextPage}
          />
        </TabsContent>

        <TabsContent value="customers">
          <CustomerTable
            customers={customers}
            filteredCustomers={filteredCustomers}
            searchQuery={customersSearchQuery}
            setSearchQuery={setCustomersSearchQuery}
            page={customersPage}
            totalPages={customersTotalPages}
            totalElements={customersTotalElements}
            onPrevPage={handleCustomersPrevPage}
            onNextPage={handleCustomersNextPage}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
