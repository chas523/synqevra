"use client";

import React from "react";
import { StatCard } from "./StatCard";
import { useEntityCounts } from "@/hooks/thingsboard/dashboard/useEntityCounts";

interface UserStatsData {
  allUsers: number;
  practitioners: number;
}

const USER_STATS_DATA: UserStatsData = {
  allUsers: 28,
  practitioners: 4,
};

export function UserStats() {
  const { users, isLoading } = useEntityCounts();

  return (
    <>
      <StatCard
        label="All Users"
        value={isLoading ? "..." : users}
        className="h-full"
      />
      <StatCard
        label="Practitioners"
        value={USER_STATS_DATA.practitioners}
        className="h-full"
      />
    </>
  );
}
