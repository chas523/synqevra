"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const WidgetLibraryTabs = () => {
    const router = useRouter();
    const pathname = usePathname();

    const activeTab = pathname.includes("widgets-bundles") ? "widget-bundles" : "widget-types";

    const handleTabChange = (value: string) => {
        if (value === "widget-types") {
            router.push("/resources/widgets-library/widget-types");
        } else {
            router.push("/resources/widgets-library/widgets-bundles");
        }
    };

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList>
                <TabsTrigger value="widget-types">Widget Types</TabsTrigger>
                <TabsTrigger value="widget-bundles">Widget Bundles</TabsTrigger>
            </TabsList>
        </Tabs>
    );
};
