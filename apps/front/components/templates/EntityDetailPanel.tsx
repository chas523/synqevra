"use client";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DetailPanelHeader } from "@/components/molecules/DetailPanelHeader";
import { useEffect, useRef, useState, type ReactNode } from "react";

export interface TabConfig {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  icon?: ReactNode;
}

export interface EntityDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  tabs: TabConfig[];
  actionButtons?: ActionButton[];
  onEdit?: () => void;
  onHelp?: () => void;
  onTabChange?: (tabId: string) => void;
  defaultTab?: string;
  className?: string;
}

const buttonVariants = {
  primary:
    "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white",
  secondary:
    "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700",
  danger: "bg-red-500 hover:bg-red-600 text-white",
};

export function EntityDetailPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  tabs,
  actionButtons = [],
  onEdit,
  onHelp,
  onTabChange,
  defaultTab,
  className,
}: EntityDetailPanelProps) {
  const tabsScrollRef = useRef<HTMLDivElement | null>(null);
  const defaultTabId = defaultTab || tabs[0]?.id;
  const [activeTab, setActiveTab] = useState(defaultTabId);

  useEffect(() => {
    setActiveTab(defaultTabId);
  }, [defaultTabId, isOpen]);

  useEffect(() => {
    const container = tabsScrollRef.current;
    if (!container) {
      return;
    }

    const snapActiveTabIntoView = () => {
      const activeTrigger = container.querySelector<HTMLButtonElement>(
        `[data-tab-id="${activeTab}"]`,
      );

      if (activeTrigger) {
        activeTrigger.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    };

    snapActiveTabIntoView();
  }, [activeTab, tabs]);

  const handleTabsWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const container = tabsScrollRef.current;

    if (!container) {
      return;
    }

    const horizontalDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;

    if (horizontalDelta === 0) {
      return;
    }

    event.preventDefault();
    container.scrollBy({ left: horizontalDelta, behavior: "auto" });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className={cn(
          "w-full sm:max-w-3xl lg:max-w-4xl p-0 gap-0 flex flex-col",
          className,
        )}
      >
        <DetailPanelHeader
          title={title}
          subtitle={subtitle}
          onClose={onClose}
          onEdit={onEdit}
          onHelp={onHelp}
        />

        {/* Tabs Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            onTabChange?.(value);
          }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="relative border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50 px-4">
            <div
              ref={tabsScrollRef}
              onWheel={handleTabsWheel}
              className="w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <TabsList
                variant="line"
                className="h-auto py-0 flex w-max min-w-full justify-start"
              >
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    data-tab-id={tab.id}
                    disabled={tab.disabled}
                    className="px-3 py-2.5 text-sm data-[state=active]:font-medium whitespace-nowrap"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* Action Buttons */}
          {actionButtons.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/80">
              {actionButtons.map((action, index) => (
                <button
                  key={`action-${action.label}-${index}`}
                  type="button"
                  onClick={action.onClick}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    buttonVariants[action.variant || "secondary"],
                  )}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Tab Contents */}
          <div className="flex-1 min-h-0 overflow-auto">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="m-0 p-4 focus-visible:ring-0"
              >
                {tab.content}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

export default EntityDetailPanel;
