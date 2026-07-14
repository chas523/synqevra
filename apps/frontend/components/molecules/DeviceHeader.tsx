import { Heading, StatusBadge, Text } from "../atoms";
import { Button } from "../ui/button";

export interface DeviceHeaderProps {
  deviceName: string;
  deviceActive: boolean;
  deviceLabel?: string | null;
  onBackToList: () => void;
  className?: string;
}

const DeviceHeader = ({
  deviceName,
  deviceActive,
  deviceLabel,
  onBackToList,
  className = "",
}: DeviceHeaderProps) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div className="flex flex-col">
        <Heading level={1} size="lg" className="text-2xl font-bold">
          {deviceName}
        </Heading>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Text size="sm" className="text-gray-600">
              Status:
            </Text>
            <StatusBadge active={deviceActive}>
              {deviceActive ? "Active" : "Inactive"}
            </StatusBadge>
          </div>
          {deviceLabel && (
            <Text size="sm" className="text-muted-foreground">
              Label: {deviceLabel}
            </Text>
          )}
        </div>
      </div>
      <div>
        <Button
          onClick={onBackToList}
          variant="outline"
          size="sm"
          className="mb-6"
        >
          ← Back to Device List
        </Button>
      </div>
    </div>
  );
};

export default DeviceHeader;
