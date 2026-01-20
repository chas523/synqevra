import React from "react";

interface Step {
  id: number;
  text: string;
  completed: boolean;
}

const GETTING_STARTED_STEPS: Step[] = [
  { id: 1, text: "Configure function: Mail Server", completed: true },
  {
    id: 2,
    text: "Go to Pending Users and create (invite) First Tenant",
    completed: false,
  },
  {
    id: 3,
    text: "Go to invited e-mail and use the invitation link.",
    completed: false,
  },
  {
    id: 4,
    text: "Configure Tenant data and Tenant Administrator data (first Practitioner)",
    completed: false,
  },
  {
    id: 5,
    text: "Log in to application with Pracititioner credentials.",
    completed: false,
  },
];

export function GettingStarted() {
  return (
    <>
      <h3 className="text-sm font-semibold mb-2 shrink-0">Getting Started</h3>
      <div className="flex-1 min-h-0 overflow-auto text-xs text-muted-foreground space-y-2">
        {GETTING_STARTED_STEPS.map((step) => (
          <div key={step.id} className="flex items-start gap-2">
            <span
              className={`${
                step.completed
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              } rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0`}
            >
              {step.id}
            </span>
            <span>{step.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}
