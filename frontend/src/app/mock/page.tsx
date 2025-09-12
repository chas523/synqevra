"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostForm from "@/components/post-form";
import MqttForm from "@/components/mqtt-form";
import { useEffect, useState } from "react";
import { Device, fetchDevices } from "@/app/mock/actions";

export default function MockClient() {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);

  const loadDevices = async (page: number = 0) => {
    try {
      setLoading(true);
      const result = await fetchDevices(page);

      if (result?.success) {
        const devicesData = result.data.data || [];
        setDevices(devicesData);
      }
    } catch (err) {
      console.error("Failed to load devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices(0).then();
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mock Data</h1>
        <p className="text-gray-600">
          Mock telemetry data for ThingsBoard devices
        </p>
      </div>
      <Tabs defaultValue="post">
        <TabsList>
          <TabsTrigger value="mqtt">MQTT</TabsTrigger>
          <TabsTrigger value="post">POST</TabsTrigger>
        </TabsList>
        <TabsContent value="mqtt">
          <MqttForm />
        </TabsContent>
        <TabsContent value="post">
          <PostForm devices={devices} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
