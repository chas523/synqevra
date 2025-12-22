import { Heading } from "../atoms";
import type { DeviceFormProps } from "../organisms/DeviceForm";
import DeviceForm from "../organisms/DeviceForm";
import type { DeviceListProps } from "../organisms/DeviceList";
import DeviceList from "../organisms/DeviceList";

export interface DeviceManagementTemplateProps {
  title?: string;
  deviceFormProps: DeviceFormProps;
  deviceListProps: DeviceListProps;
  className?: string;
}

const DeviceManagementTemplate = ({
  title = "Device Management",
  deviceFormProps,
  deviceListProps,
  className = "",
}: DeviceManagementTemplateProps) => {
  const baseStyles = ["container", "mx-auto", "p-6"];

  const allStyles = [...baseStyles, className];

  return (
    <div className={allStyles.join(" ")}>
      <div className="flex flex-col max-w-6xl mx-auto gap-2">
        <Heading level={1} size="lg" className="mb-6">
          {title}
        </Heading>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeviceForm {...deviceFormProps} />

          <DeviceList {...deviceListProps} />
        </div>
      </div>
    </div>
  );
};

export default DeviceManagementTemplate;
