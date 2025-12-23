import type { Observation } from "@medplum/fhirtypes";
import ObservationDateGroup from "../organisms/ObservationDateGroup";
import { ArrowLeftCircleIcon } from "lucide-react";
import HeaderWithTextAndButton from "../molecules/HeaderWithTextAndButton";
import { useRouter } from "next/navigation";

interface ObservationCardProps {
  observations: Observation[];
  patientId: string;
}

const ObservationPage = ({ observations, patientId }: ObservationCardProps) => {
  const router = useRouter();
  const groupObservationsByDate = (observations: Observation[]) => {
    const grouped = new Map<string, Observation[]>();

    observations.forEach((obs) => {
      if (obs.effectiveDateTime) {
        const date = obs.effectiveDateTime.split("T")[0];
        if (!grouped.has(date)) {
          grouped.set(date, []);
        }
        const arr = grouped.get(date);
        if (arr) {
          arr.push(obs);
        }
      }
    });

    //sort dates ascending
    return Array.from(grouped.entries())
      .sort(
        ([dateA], [dateB]) =>
          new Date(dateB).getTime() - new Date(dateA).getTime(),
      )
      .map(([date, observations]) => ({ date, observations }));
  };

  const groupedObservations = groupObservationsByDate(observations);

  return (
    <div className="space-y-4 mb-6">
      <HeaderWithTextAndButton
        mainText="Patient Observations"
        miniText="View and filter patient observations"
        buttonText="Back to patient"
        buttonIcon={<ArrowLeftCircleIcon />}
        onButtonClick={() => router.push(`/patients/${patientId}`)}
      />

      {groupedObservations.map(({ date, observations }) => (
        <ObservationDateGroup
          key={date}
          date={date}
          observations={observations}
        />
      ))}
    </div>
  );
};

export default ObservationPage;
