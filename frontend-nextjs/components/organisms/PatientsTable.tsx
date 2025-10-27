import { useRouter } from "next/navigation";
import React from "react";
import { PatientShort } from "@/types/patientTypes";
import { DeviceTableRow } from "../molecules";
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

const PatientsTable = ({ patients }: { patients: PatientShort[] }) => {
  const router = useRouter();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Patient List</CardTitle>
        <div>
          <Button onClick={() => router.push("patients/add")}>
            Add new patient
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photography</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Telecom</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <PatientTableRow key={patient.id} patient={patient} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PatientsTable;
