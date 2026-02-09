import { DeviceCommunicationChart } from "@/components/organisms/DeviceCommunicationChart";
import { SystemChart } from "@/components/organisms/SystemMetricChart";
import { TenantStats } from "@/components/organisms/TenantStats";
import { ResourceUsageStats } from "@/components/organisms/ResourceUsageStats";
import { Functions } from "@/components/molecules/Functions";
import { Version } from "@/components/molecules/Version";
import { GettingStarted } from "@/components/molecules/GettingStarted";
import { Documentation } from "@/components/molecules/Documentation";
import { UserStats } from "@/components/molecules/UserStats";
import TileTemplate from "@/components/templates/TileTemplate";
import React from "react";

const Dashboard = () => {
  return (
    <div className="h-[calc(100vh-64px-16px-16px)] w-full grid grid-cols-1 md:grid-cols-12 md:grid-rows-10 gap-2 overflow-auto md:overflow-hidden">
      <TenantStats />
      <ResourceUsageStats />
      <TileTemplate colSpan={2} rowSpan={8}>
        <GettingStarted />
      </TileTemplate>
      <TileTemplate colSpan={4} rowSpan={2} gridCols={2}>
        <UserStats />
      </TileTemplate>
      <TileTemplate colSpan={6} rowSpan={4}>
        <SystemChart />
      </TileTemplate>
      <TileTemplate colSpan={4} rowSpan={2}>
        <Functions />
      </TileTemplate>
      <TileTemplate colSpan={10} rowSpan={4}>
        <DeviceCommunicationChart />
      </TileTemplate>
      <TileTemplate colSpan={2} rowSpan={2}>
        <Version />
      </TileTemplate>
      {/* We were advised to delete/hide <Documentation /> component for now */}
      {/* <TileTemplate colSpan={4} rowSpan={2}>
        <Documentation />
      </TileTemplate> */}
    </div>
  );
};

export default Dashboard;
