export interface ThingsboardCredentials {
  url: string;
  username: string;
  password: string;
}

export interface Asset {
  id?: string;
  name: string;
  label: string;
  asset_profile_id?: string;
  [key: string]: any;
}

export interface Device {
  id?: string;
  name: string;
  label?: string;
  device_profile_id?: string;
  device_type?: string;
  transport_type?: string;
  [key: string]: any;
}

export interface DeviceProfileData {
  configuration: {
    type: string;
    [key: string]: any;
  };
  transport_configuration: {
    type: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface DeviceProfile {
  id?: string;
  name: string;
  type: string;
  transport_type: string;
  profile_data: DeviceProfileData;
  [key: string]: any;
}

export interface EntityRelation {
  from: string;
  to: string;
  type: string;
  [key: string]: any;
}
