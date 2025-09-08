"use client";

import Link from "next/link";

export const Sidebar = () => {
  return (
    <div className="w-64 bg-sky-600 border-r h-screen fixed left-0 top-0 p-4">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">TB</h2>
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded-lg text-primary-foreground font-medium transition-all duration-200 hover:opacity-90 hover:translate-x-1"
          >
            Dashboard
          </Link>
          <Link
            href="/assets"
            className="block px-4 py-2 rounded-lg text-primary-foreground font-medium transition-all duration-200 hover:opacity-90 hover:translate-x-1"
          >
            Assets
          </Link>
          <Link
            href="/medplum"
            className="block px-4 py-2 rounded-lg text-primary-foreground font-medium transition-all duration-200 hover:opacity-90 hover:translate-x-1"
          >
            Medplum
          </Link>
          <Link
            href="/rulechain"
            className="block px-4 py-2 rounded-lg text-primary-foreground font-medium transition-all duration-200 hover:opacity-90 hover:translate-x-1"
          >
            Rule Chain
          </Link>
        </nav>
      </div>
    </div>
  );
};
