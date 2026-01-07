import { Heading } from "../atoms";
import HeaderWithText from "../molecules/HeaderWithText";
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
  const baseStyles = ["p-2"];

  const allStyles = [...baseStyles, className];

  return (
    <div className={allStyles.join(" ")}>
      <div className="flex flex-col  gap-2">
        <HeaderWithText
          mainText={title}
          miniText="Create IoT devices and assign them to patients. You should set accurate thresholds for upcoming observations."
        />

        <img
          src="/device-flow.svg"
          alt="Device Flow Animation"
          className="w-full h-auto mb-2"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeviceForm {...deviceFormProps} />

          <DeviceList {...deviceListProps} />
        </div>
      </div>
    </div>
  );
};

export default DeviceManagementTemplate;
