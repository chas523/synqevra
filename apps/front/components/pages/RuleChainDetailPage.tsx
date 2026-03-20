"use client";

import { RuleChainEditor } from "@/components/organisms/rule-chain-editor/RuleChainEditor";

interface RuleChainDetailPageProps {
  ruleChainId: string;
  ruleChainName?: string;
}

export default function RuleChainDetailPage({
  ruleChainId,
  ruleChainName = "Rule Chain Editor",
}: RuleChainDetailPageProps) {
  return (
    <RuleChainEditor ruleChainId={ruleChainId} ruleChainName={ruleChainName} />
  );
}
