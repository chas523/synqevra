"use client";

interface CustomerPlaceholderTabContentProps {
  title: string;
}

export function CustomerPlaceholderTabContent({
  title,
}: CustomerPlaceholderTabContentProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/30 dark:text-slate-300">
      {title} content coming soon.
    </div>
  );
}
