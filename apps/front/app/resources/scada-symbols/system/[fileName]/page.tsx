interface ScadaSymbolDetailsPageProps {
  params: Promise<{
    fileName: string;
  }>;
}

export default async function ScadaSymbolDetailsPage({
  params,
}: ScadaSymbolDetailsPageProps) {
  const { fileName } = await params;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">SCADA Symbol Details</h1>
      <p>Details for {decodeURIComponent(fileName)}</p>
      <div className="mt-4 p-4 border rounded bg-muted/20">
        TODO: Implement SCADA Symbol details view here.
      </div>
    </div>
  );
}
