"use client";

import { useLocalStorage } from "@mantine/hooks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import InfoTooltip from "@/components/molecules/InfoTooltip";

export const MedplumSettings = () => {
  const [enabled, setEnabled] = useLocalStorage({
    key: "medplum-enabled",
    defaultValue: false,
  });

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Medplum</CardTitle>
        <CardAction>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>Enable Medplum integration features.</p>
              </div>
            }
          />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="space-y-0.5">
            <Label htmlFor="medplum-toggle">Turn on Medplum</Label>
            <p className="text-sm text-muted-foreground">
              Get access to Medplum features.
            </p>
          </div>
          <Switch
            id="medplum-toggle"
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};
