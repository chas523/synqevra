import { TenantDetailsPage } from "@/components/pages/TenantDetailsPage";

interface TenantDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TenantDetails({
  params,
}: TenantDetailsPageProps) {
  const { id } = await params;
  return <TenantDetailsPage tenantId={id} />;
}
