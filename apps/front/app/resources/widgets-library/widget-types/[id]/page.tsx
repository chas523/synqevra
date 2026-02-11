import { WidgetTypeDetailPage } from "@/components/pages/WidgetTypeDetailPage";

export default function Page({ params }: { params: { id: string } }) {
    return <WidgetTypeDetailPage id={params.id} />;
}
