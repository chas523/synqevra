import { Patient } from "@medplum/fhirtypes";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { PatientShort } from "@/types/patientTypes";
import { DeviceTableRow } from "../molecules";
import HeaderWithTextAndButton from "../molecules/HeaderWithTextAndButton";
import PatientCard from "../molecules/PatientCard";
import PatientTableRow from "../molecules/PatientTableRow";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const PatientsGrid = ({ patients }: { patients: Patient[] }) => {
  const router = useRouter();
  return (
    <>
      <HeaderWithTextAndButton
        mainText="Patient List"
        miniText="Manage and view all patient records"
        buttonText="Add new patient"
        onButtonClick={() => router.push("patients/add")}
      />
      {/* patients grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {patients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </>
  );
};

export default PatientsGrid;
