"use client";

import {
  Thermometer,
  Heart,
  Wind,
  Activity,
  Droplets,
  Zap,
} from "lucide-react";

export interface DeviceIconProps {
  type: string;
  className?: string;
}

const DeviceIcon = ({ type, className = "w-6 h-6" }: DeviceIconProps) => {
  switch (type?.toLowerCase()) {
    case "temperature":
      return <Thermometer className={className} />;
    case "heart_rate":
      return <Heart className={className} />;
    case "oxygen":
      return <Wind className={className} />;
    case "blood_pressure":
      return <Activity className={className} />;
    case "glucose":
      return <Droplets className={className} />;
    case "ecg":
      return <Zap className={className} />;
    default:
      return <Zap className={className} />;
  }
};

export default DeviceIcon;
