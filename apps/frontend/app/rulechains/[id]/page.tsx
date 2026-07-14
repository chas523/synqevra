"use client";

import { use } from "react";
import RuleChainDetailPage from "@/components/pages/RuleChainDetailPage";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RuleChainDetailPage ruleChainId={id} ruleChainName="Rule Chain Editor" />
  );
}
