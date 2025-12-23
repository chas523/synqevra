"use client";

import type { Patient } from "@medplum/fhirtypes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  PatientBasicInfo,
  PatientContactInfo,
  PatientHeader,
  PatientPersonalInfo,
} from "../organisms";
import { PatientAvatarCarousel } from "./AvatarCarousel";

interface PatientCardProps {
  patient: Patient;
}

const PatientCard = ({ patient }: PatientCardProps) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const name = patient.name?.[0];
  const fullName = name
    ? `${name.given?.join(" ") || ""} ${name.family || ""}`.trim()
    : "Unknown Patient";

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const photos = patient.photo || [];

  return (
    <Card
      className="group gap-3 relative overflow-hidden bg-white border-2 border-slate-200 transition-all duration-300 hover:border-cyan-400 hover:shadow-2xl hover:-translate-y-1 h-[450px] flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`h-1 w-full bg-gradient-to-r transition-all duration-500 flex-shrink-0 ${
          patient.active
            ? "from-emerald-400 via-teal-400 to-cyan-400"
            : "from-slate-300 via-slate-400 to-slate-500"
        }`}
      />

      <div className="px-4 flex flex-col flex-1 min-h-0">
        <PatientHeader patient={patient} />

        <div className="relative mb-3 flex justify-center flex-shrink-0">
          <PatientAvatarCarousel
            photos={photos}
            fullName={fullName}
            initials={initials}
            isHovered={isHovered}
          />
        </div>

        <PatientBasicInfo patient={patient} />

        <div className="px-2 flex-shrink-0 h-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <PatientPersonalInfo patient={patient} />
        </div>

        <div className="border-t-2 border-slate-200 pt-2 mb-2 flex-shrink-0 h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <PatientContactInfo patient={patient} />
        </div>

        <div className="flex-grow"></div>

        <Button
          className="cursor-pointer w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-sm flex-shrink-0"
          size="sm"
          onClick={() => {
            router.push(`/patients/${patient.id}`);
          }}
        >
          View Full Profile
        </Button>
      </div>
    </Card>
  );
};
export default PatientCard;
