"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Thermometer,
  Heart,
  Activity,
  Droplet,
  Wind,
  Brain,
  Eye,
} from "lucide-react";

interface TelemetrySidebarProps {
  availableTelemetry: Array<{ key: string; label: string; unit?: string }>;
  configuredKeys: string[];
  onAddTelemetry: (key: string) => void;
}

//change later to match icons with telemetry keys more accurately
const getIconForTelemetry = (key: string) => {
  if (key.includes("temperature")) return Thermometer;
  if (key.includes("heart") || key.includes("pulse")) return Heart;
  if (key.includes("oxygen") || key.includes("spo2")) return Droplet;
  if (key.includes("pressure")) return Activity;
  if (key.includes("respiratory") || key.includes("breath")) return Wind;
  if (key.includes("glucose")) return Brain;
  return Eye;
};

export function TelemetrySidebar({
  availableTelemetry,
  configuredKeys,
  onAddTelemetry,
}: TelemetrySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTelemetry = availableTelemetry.filter(
    (t) =>
      !configuredKeys.includes(t.key) &&
      (t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.key.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div
        className="fixed right-0 top-0 bottom-0 w-16 z-40"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2  mr-2 ">
          <img
            src="/blink-arrow.svg"
            alt="Device Flow Animation"
            className="w-full h-auto"
          />
        </div>

        <div
          className={`absolute right-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-2">
                Add Telemetry
              </h3>
              <p className="text-slate-400 text-sm">
                Select parameters to monitor
              </p>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search telemetry..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-slate-800/50 hover:scrollbar-thumb-cyan-500/50">
              {filteredTelemetry.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  {searchQuery
                    ? "No telemetry found"
                    : "All telemetry configured"}
                </div>
              ) : (
                filteredTelemetry.map((telemetry) => {
                  const Icon = getIconForTelemetry(telemetry.key);
                  return (
                    <button
                      key={telemetry.key}
                      onClick={() => {
                        onAddTelemetry(telemetry.key);
                        setSearchQuery("");
                      }}
                      className="cursor-pointer w-full flex items-center gap-3 p-3 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/30 hover:border-cyan-500/50 rounded-lg transition-all group"
                    >
                      <div className="p-2 bg-cyan-500/10 group-hover:bg-cyan-500/20 rounded-lg border border-cyan-500/20 transition-colors">
                        <Icon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-white text-sm font-medium">
                          {telemetry.label}
                        </div>
                        {telemetry.unit && (
                          <div className="text-slate-400 text-xs">
                            {telemetry.unit}
                          </div>
                        )}
                      </div>
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
