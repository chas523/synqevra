export interface CreateDeviceRequest {
  name: string;
  label: string | null;
  parameters?: string[];
}
