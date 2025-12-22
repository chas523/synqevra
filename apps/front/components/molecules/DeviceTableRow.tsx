import type { Device } from "@/types/thingsboardDeviceTypes";
import { StatusBadge } from "../atoms";
import { TableCell, TableRow } from "../ui/table";

export interface DeviceTableRowProps {
  device: Device;
  onClick: (device: Device) => void;
  className?: string;
}

const DeviceTableRow = ({
  device,
  onClick,
  className = "",
}: DeviceTableRowProps) => {
  const baseStyles = [
    "cursor-pointer",
    "hover:bg-gray-50",
    "dark:hover:bg-gray-800",
  ];
  const allStyles = [...baseStyles, className];

  return (
    <TableRow className={allStyles.join(" ")} onClick={() => onClick(device)}>
      <TableCell className="font-medium">{device.name}</TableCell>
      <TableCell>{device.type || "N/A"}</TableCell>
      <TableCell>
        <StatusBadge active={device.active}>
          {device.active ? "Active" : "Inactive"}
        </StatusBadge>
      </TableCell>
      <TableCell>{device.label || "-"}</TableCell>
    </TableRow>
  );
};

export default DeviceTableRow;
