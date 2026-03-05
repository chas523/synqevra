"use client";

import { Box } from "lucide-react";

export default function EntitiesAssetsPage() {
  return (
    <div className="h-full relative overflow-hidden">
      <div className="relative w-full px-6 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-xl border border-cyan-200 dark:border-cyan-500/30">
            <Box className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Assets
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Manage your assets
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-12 shadow-sm">
          <div className="text-center text-slate-400 dark:text-slate-500">
            <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Coming soon</p>
            <p className="text-sm mt-1">This page is under construction</p>
          </div>
        </div>
      </div>
    </div>
  );
}
