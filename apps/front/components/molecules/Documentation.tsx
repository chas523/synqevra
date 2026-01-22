import React from "react";

interface DocLink {
  id: string;
  title: string;
  url: string;
}

const DOCUMENTATION_LINKS: DocLink[] = [
  {
    id: "getting-started",
    title: "Getting started",
    url: "/docs/getting-started",
  },
  {
    id: "tenant-profiles",
    title: "Tenant profiles",
    url: "/docs/tenant-profiles",
  },
  { id: "api", title: "API", url: "/docs/api" },
  { id: "widgets", title: "Widgets Library", url: "/docs/widgets" },
];

export function Documentation() {
  return (
    <>
      <h4 className="text-xs font-medium text-muted-foreground mb-1 shrink-0">
        Documentation
      </h4>
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-1 text-[10px]">
        {DOCUMENTATION_LINKS.map((link) => (
          <a
            key={link.id}
            href={link.url}
            className="bg-muted/50 rounded px-2 py-1 flex items-center gap-1 truncate hover:bg-muted transition-colors"
          >
            {link.title}
          </a>
        ))}
      </div>
    </>
  );
}
