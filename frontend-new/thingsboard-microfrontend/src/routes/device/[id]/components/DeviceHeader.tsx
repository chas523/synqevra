import { Button } from '@/components/ui/button';

interface DeviceHeaderProps {
  deviceName: string;
  deviceActive: boolean;
  deviceLabel?: string | null;
  onBackToList: () => void;
}

export const DeviceHeader = ({
  deviceName,
  deviceActive,
  deviceLabel,
  onBackToList,
}: DeviceHeaderProps) => {
  return (
    <div className="p-2 flex justify-between items-center">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">{deviceName}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            Status:{' '}
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                deviceActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {deviceActive ? 'Active' : 'Inactive'}
            </span>
          </span>
          {deviceLabel && <span>Label: {deviceLabel}</span>}
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