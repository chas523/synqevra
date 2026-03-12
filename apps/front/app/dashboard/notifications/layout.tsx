"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Send, Users, Shield, Inbox } from "lucide-react";

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { name: "Inbox", path: "/dashboard/notifications/inbox", icon: Inbox },
    { name: "Sent", path: "/dashboard/notifications/sent", icon: Send },
    {
      name: "Recipients",
      path: "/dashboard/notifications/recipients",
      icon: Users,
    },
    {
      name: "Templates",
      path: "/dashboard/notifications/templates",
      icon: Users,
    }, // Using Users icon as placeholder, or FileText if available
    { name: "Rules", path: "/dashboard/notifications/rules", icon: Shield },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs Navigation */}
      <div className="border-b">
        <nav className="flex gap-4" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.path ||
              (pathname === "/dashboard/notifications" &&
                tab.path.includes("inbox"));
            const Icon = tab.icon;

            return (
              <button
                key={tab.name}
                onClick={() => router.push(tab.path)}
                className={`
                                    flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm
                                    transition-colors
                                    ${
                                      isActive
                                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                                    }
                                `}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{children}</div>
    </div>
  );
}
