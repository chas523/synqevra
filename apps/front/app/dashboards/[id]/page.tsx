import { DashboardDetailPage } from "@/components/pages/DashboardDetailPage";

interface DashboardRouteProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardRoute({ params }: DashboardRouteProps) {
  const { id } = await params;
  return <DashboardDetailPage dashboardId={id} />;
}
