import Image from "next/image";
import { useRouter } from "next/navigation";
import { PatientShort } from "@/types/patientTypes";
import type { Device } from "@/types/thingsboardDeviceTypes";
import { StatusBadge } from "../atoms";
import { TableCell, TableRow } from "../ui/table";

export interface PatientTableRowProps {
  patient: PatientShort;
  className?: string;
}

const PatientTableRow = ({ patient, className = "" }: PatientTableRowProps) => {
  const router = useRouter();

  const baseStyles = [
    "cursor-pointer",
    "hover:bg-gray-50",
    "dark:hover:bg-gray-800",
  ];
  const allStyles = [...baseStyles, className];

  return (
    <TableRow
      className={allStyles.join(" ")}
      onClick={() => router.push(`/patients/${patient.id}`)}
    >
      <TableCell>
        {patient.photo && patient.photo.length > 0 ? (
          <Image
            src={patient.photo[0].url}
            alt={`${patient.name[0].given.join(" ")} ${patient.name[0].family}`}
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-[10px] text-center overflow-hidden whitespace-nowrap p-1">
            No Photo
          </div>
        )}
      </TableCell>
      <TableCell>{patient.name[0].family}</TableCell>
      <TableCell>{patient.name[0].given.join(" ")}</TableCell>
      <TableCell>
        {patient.telecom?.[0]?.value
          ? patient.telecom[0].value
          : "no contact phone"}
      </TableCell>
    </TableRow>
  );
};

export default PatientTableRow;
