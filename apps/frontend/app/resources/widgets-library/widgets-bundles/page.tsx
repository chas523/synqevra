import { WidgetBundlesPage } from "@/components/pages/WidgetBundlesPage";
import { WidgetLibraryTabs } from "@/components/organisms/WidgetLibraryTabs";

export default function Page() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">
          Widgets Library
        </h1>
        <p className="text-muted-foreground">
          Manage your widget types and bundles.
        </p>
      </div>

      <WidgetLibraryTabs />

      <div className="space-y-4">
        <WidgetBundlesPage />
      </div>
    </div>
  );
}
