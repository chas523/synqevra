"use client";

import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useState } from "react";
import { DeviceTemperatureSendButton } from "@/app/medplum/components/device/sendDataToMedplum";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type Device,
  getPowerConsumptionInfo,
  getPressureInfo,
  getTemperatureInfo,
} from "@/lib/utils";

interface DeviceTableProps {
  devices: Device[];
  filteredDevices: Device[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  page: number;
  totalPages: number;
  totalElements: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export const DeviceTable = ({
  devices,
  filteredDevices,
  searchQuery,
  setSearchQuery,
  page,
  totalPages,
  totalElements,
  onPrevPage,
  onNextPage,
}: DeviceTableProps) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchChange = (query: string) => {
    setLocalSearchQuery(query);
    setSearchQuery(query);
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-xl">Devices Management</h2>
        <div className="relative">
          <div className="relative w-72 transition-all duration-300 focus-within:w-80 hover:w-76">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground
                            transition-colors duration-300 group-hover:text-primary"
            />
            <Input
              placeholder="Search devices..."
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-white border-2 border-gray-200
                            transition-all duration-800 hover:border-gray-300 shadow-sm group"
            />
            {localSearchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full
                                bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
              </button>
            )}
          </div>
        </div>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 text-lg">No devices found.</p>
            <p className="text-gray-400 mt-2">Add devices to get started</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-500">
            Showing {filteredDevices.length} of {devices.length} devices
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-4 text-left font-semibold">Name</th>
                      <th className="p-4 text-left font-semibold">Type</th>
                      <th className="p-4 text-left font-semibold">Transport</th>
                      <th className="p-4 text-left font-semibold">
                        Temperature
                      </th>
                      <th className="p-4 text-left font-semibold">Pressure</th>
                      <th className="p-4 text-left font-semibold">
                        Power Consumption
                      </th>
                      <th className="p-4 text-left font-semibold">Task</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevices.map((device, index) => (
                      <tr
                        key={device.id?.id || index}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4">
                          {device.name || "Unnamed Device"}
                        </td>
                        <td className="p-4">{device.type || "No type info"}</td>
                        <td className="p-4">
                          {device.transportType || "Unknown"}
                        </td>
                        <td className="p-4">{getTemperatureInfo(device)}</td>
                        <td className="p-4">{getPressureInfo(device)}</td>
                        <td className="p-4">
                          {getPowerConsumptionInfo(device)}
                        </td>
                        <td className="p-4">
                          <DeviceTemperatureSendButton device={device} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Page {page + 1} of {totalPages} • Total devices: {totalElements}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevPage}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNextPage}
                disabled={page >= totalPages - 1}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
