import type { Device } from "@/types/thingsboardDeviceTypes";
import { Text } from "../atoms";
import { DeviceTableRow, Pagination } from "../molecules";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export interface DeviceListProps {
  devices: Device[];
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error?: Error | null;
  onDeviceClick: (device: Device) => void;
  onPageChange: (page: number) => void;
  className?: string;
}

const DeviceList = ({
  devices,
  totalPages,
  currentPage,
  isLoading,
  error,
  onDeviceClick,
  onPageChange,
  className = "",
}: DeviceListProps) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <Text color="muted">Loading devices...</Text>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <Text color="error">Error loading devices</Text>
        </div>
      );
    }

    if (devices.length === 0) {
      return (
        <div className="text-center py-8">
          <Text color="muted">No devices to display</Text>
        </div>
      );
    }

    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Label</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => (
              <DeviceTableRow
                key={device.id?.id}
                device={device}
                onClick={onDeviceClick}
              />
            ))}
          </TableBody>
        </Table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="mt-4"
        />
      </>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Device List</CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

export default DeviceList;
