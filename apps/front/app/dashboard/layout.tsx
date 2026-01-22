import { TelemetryProvider } from "@/lib/context/TelemetryContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TelemetryProvider>{children}</TelemetryProvider>;
}
