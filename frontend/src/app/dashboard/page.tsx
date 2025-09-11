"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { fetchUsageData } from "./actions";
import { Button } from "@/components/ui/button";
import { logout } from "../(auth)/login/actions";
import { medplum } from "@/lib/medplum";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UsageData {
  devices?: number;
  maxDevices?: number;
  users?: number;
  maxUsers?: number;
  assets?: number;
  maxAssets?: number;
  alarms?: number;
  maxAlarms?: number;
}

export default function DashboardPage() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    if (medplum.isAuthenticated()) await medplum.signOut();
    await logout();
  };

  useEffect(() => {
    const loadUsageData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchUsageData();

        if (result.success) {
          setUsageData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Failed to load usage data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadUsageData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Loading dashboard data...
          </h2>
          <p className="text-gray-500">
            Please wait while we fetch the latest information.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">
            Error loading data
          </h2>
          <p className="text-gray-500">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex items-center justify-between mb-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900">
            Medical Monitoring Dashboard
          </h1>
          <p className="text-gray-600">Connected to ThingsBoard Platform</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md"
        >
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg animate-card-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData?.devices || 0}</div>
            <p className="text-xs text-gray-500">
              of {usageData?.maxDevices || 0} max
            </p>
          </CardContent>
        </Card>

        <Card
          className="transition-all duration-300 hover:scale-105 hover:shadow-lg animate-card-in"
          style={{ animationDelay: "0.1s" }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData?.users || 0}</div>
            <p className="text-xs text-gray-500">
              of {usageData?.maxUsers || 0} max
            </p>
          </CardContent>
        </Card>

        <Card
          className="transition-all duration-300 hover:scale-105 hover:shadow-lg animate-card-in"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData?.assets || 0}</div>
            <p className="text-xs text-gray-500">
              of {usageData?.maxAssets || 0} max
            </p>
          </CardContent>
        </Card>

        <Card
          className="transition-all duration-300 hover:scale-105 hover:shadow-lg animate-card-in"
          style={{ animationDelay: "0.3s" }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Alarms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {usageData?.alarms || 0}
            </div>
            <p className="text-xs text-gray-500">
              of {usageData?.maxAlarms || 0} max
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 max-w-xl">
        <Card className="transition-all duration-300 hover:shadow-xl animate-fade-in">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground transition-transform duration-300 hover:scale-125" />
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                <h2 className="font-medium">Device Usage</h2>
                <p className="font-semibold">
                  {usageData
                    ? `${usageData.devices} / ${usageData.maxDevices}`
                    : 0}
                </p>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                <h2 className="font-medium">User Usage</h2>
                <p className="font-semibold">
                  {usageData ? `${usageData.users} / ${usageData.maxUsers}` : 0}
                </p>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                <h2 className="font-medium">Asset Usage</h2>
                <p className="font-semibold">
                  {usageData
                    ? `${usageData.assets} / ${usageData.maxAssets}`
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
