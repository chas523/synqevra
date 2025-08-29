"use client"

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchCustomers, fetchDevices } from "@/app/medplum/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer, Device, getPowerConsumptionInfo, getPressureInfo, getTemperatureInfo } from "@/lib/utils";

type TabValue = "devices" | "customers";

export default function MedplumPage() {
    const [loading, setLoading] = useState(false);
    const [devices, setDevices] = useState<Device[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [activeTab, setActiveTab] = useState<TabValue>("devices");

    useEffect(() => {
        const loadDevices = async () => {
            try {
                setLoading(true);
                const result = await fetchDevices();

                if (result?.success) setDevices(result.data.data || []);

            } catch (err) {
                console.error("Failed to load devices:", err);
            } finally {
                setLoading(false);
            }
        };
        loadDevices();
    }, []);

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                setLoading(true);
                const result = await fetchCustomers();

                if (result?.success) setCustomers(result.data.data || []);

            } catch (err) {
                console.error("Failed to load customers:", err);
            } finally {
                setLoading(false);
            }
        };
        loadCustomers();
    }, []);


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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Medplum Dashboard</h1>
                <p className="text-gray-600">Manage your devices and customers</p>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                    <TabsTrigger value="devices" className='transition-all duration-300 hover:scale-105 hover:shadow-lg'>
                        Devices ({devices.length})
                    </TabsTrigger>
                    <TabsTrigger value="customers" className='transition-all duration-300 hover:scale-105 hover:shadow-lg'>
                        Customers ({customers.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="devices">
                    <div className="mb-12">
                        <h2 className="font-bold mb-6 text-xl">Devices Management</h2>

                        {devices.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <p className="text-gray-500 text-lg">No devices found.</p>
                                    <p className="text-gray-400 mt-2">Add devices to get started</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="p-4 text-left font-semibold">Name</th>
                                                <th className="p-4 text-left font-semibold">Type</th>
                                                <th className="p-4 text-left font-semibold">Transport</th>
                                                <th className="p-4 text-left font-semibold">Temperature</th>
                                                <th className="p-4 text-left font-semibold">Pressure</th>
                                                <th className="p-4 text-left font-semibold">Power Consumption</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {devices.map((device, index) => (
                                                <tr key={device.id?.id || index} className="border-b hover:bg-gray-50">
                                                    <td className="p-4">{device.name || "Unnamed Device"}</td>
                                                    <td className="p-4">{device.type || "No type info"}</td>
                                                    <td className="p-4">{device.transportType || "Unknown"}</td>
                                                    <td className="p-4">{getTemperatureInfo(device)}</td>
                                                    <td className="p-4">{getPressureInfo(device)}</td>
                                                    <td className="p-4">{getPowerConsumptionInfo(device)}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="customers">
                    <div>
                        <h2 className="font-bold mb-6 text-xl">Customers Management</h2>

                        {customers.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <p className="text-gray-500 text-lg">No customers found.</p>
                                    <p className="text-gray-400 mt-2">Add customers to get started</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="p-4 text-left font-semibold">Name</th>
                                                <th className="p-4 text-left font-semibold">Email</th>
                                                <th className="p-4 text-left font-semibold">Country</th>
                                                <th className="p-4 text-left font-semibold">City</th>
                                                <th className="p-4 text-left font-semibold">Address</th>
                                                <th className="p-4 text-left font-semibold">ID</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {customers.map((customer, index) => (
                                                <tr key={customer.id?.id || index} className="border-b hover:bg-gray-50">
                                                    <td className="p-4">{customer.name || "Not specified"}</td>
                                                    <td className="p-4">{customer.email || "Not specified"}</td>
                                                    <td className="p-4">{customer.country || "Not specified"}</td>
                                                    <td className="p-4">{customer.city || "Not specified"}</td>
                                                    <td className="p-4">{customer.address || "Not specified"}</td>
                                                    <td className="p-4 text-sm text-gray-500">{customer.id?.id || "N/A"}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}