import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssetForm from "@/components/asset-form";
import DeviceForm from "@/components/device-form";

export default function Tb() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Tabs defaultValue="asset">
        <TabsList>
          <TabsTrigger value="asset">Asset</TabsTrigger>
          <TabsTrigger value="device">Device</TabsTrigger>
        </TabsList>
        <TabsContent value="asset">
          <Card>
            <CardHeader>
              <CardTitle>Asset</CardTitle>
              <CardDescription>
                Create new asset in ThingsBoard with default asset profile
              </CardDescription>
            </CardHeader>
            <AssetForm />
          </Card>
        </TabsContent>
        <TabsContent value="device">
          <Card>
            <CardHeader>
              <CardTitle>Device</CardTitle>
              <CardDescription>
                Create new device in ThingsBoard
              </CardDescription>
            </CardHeader>
            <DeviceForm />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
