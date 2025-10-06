import { useEffect, useState } from "react";
import { medplum } from "@/lib/medplum";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Observation {
  id: string;
  subject?: {
    reference?: string;
    display?: string;
  };
  code?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  valueQuantity?: {
    value?: number;
    unit?: string;
  };
  valueString?: string;
  status?: string;
  effectiveDateTime?: string;
}

export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndLoadObservations();
  }, []);

  const checkAuthAndLoadObservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const authenticated = await medplum.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        setError("Not authenticated. Please login to Medplum first.");
        return;
      }

      const observationBundle = await medplum.searchResources("Observation", {
        _sort: "-_lastUpdated",
      });

      setObservations(observationBundle);
    } catch (err) {
      console.error("Error loading observations:", err);
      setError("Failed to load observations");
    } finally {
      setLoading(false);
    }
  };

  const getSubjectDisplay = (observation: Observation) => {
    if (observation.subject?.display) {
      return observation.subject.display;
    }
    if (observation.subject?.reference) {
      return observation.subject.reference;
    }
    return "Unknown";
  };

  const getCodeDisplay = (observation: Observation) => {
    if (observation.code?.text) {
      return observation.code.text;
    }
    if (observation.code?.coding && observation.code.coding.length > 0) {
      const coding = observation.code.coding[0];
      return coding.display || coding.code || "Unknown";
    }
    return "Unknown";
  };

  const getValueDisplay = (observation: Observation) => {
    if (observation.valueQuantity) {
      const value = observation.valueQuantity.value;
      const unit = observation.valueQuantity.unit || "";
      return `${value} ${unit}`.trim();
    }
    if (observation.valueString) {
      return observation.valueString;
    }
    return "N/A";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Observations...
          </h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6 bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please login to Medplum to view observations.
            </p>
            <Button onClick={() => (window.location.href = "/rulechain")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Observations</h1>
        <p className="text-gray-600">
          Medical observations from Medplum FHIR server
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
            <Button
              onClick={checkAuthAndLoadObservations}
              className="mt-2"
              size="sm"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Observations ({observations.length})</span>
            <Button
              onClick={checkAuthAndLoadObservations}
              size="sm"
              variant="outline"
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {observations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-lg">No observations found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-4 text-left font-semibold">ID</th>
                    <th className="p-4 text-left font-semibold">
                      Last Updated
                    </th>
                    <th className="p-4 text-left font-semibold">Subject</th>
                    <th className="p-4 text-left font-semibold">Code</th>
                    <th className="p-4 text-left font-semibold">Value</th>
                    <th className="p-4 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {observations.map((observation) => (
                    <tr
                      key={observation.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-4 font-mono text-sm">
                        {observation.id}
                      </td>
                      <td className="p-4 text-sm">
                        {formatDate(observation.effectiveDateTime)}
                      </td>
                      <td className="p-4">{getSubjectDisplay(observation)}</td>
                      <td className="p-4">{getCodeDisplay(observation)}</td>
                      <td className="p-4 font-medium">
                        {getValueDisplay(observation)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            observation.status === "final"
                              ? "bg-green-100 text-green-800"
                              : observation.status === "preliminary"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {observation.status || "unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
