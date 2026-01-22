import { TenantDevicesPage } from "@/components/pages/TenantDevicesPage";

interface TenantDevicesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TenantDevices({
  params,
}: TenantDevicesPageProps) {
  const { id } = await params;
  return <TenantDevicesPage tenantId={id} />;
}
