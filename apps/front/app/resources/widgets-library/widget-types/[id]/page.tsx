"use client";

import React from "react";
import { useParams } from "next/navigation";
import { WidgetTypeDetailPage } from "@/components/pages/WidgetTypeDetailPage";

export default function WidgetEditorPage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) return null;

  return <WidgetTypeDetailPage id={id} />;
}
