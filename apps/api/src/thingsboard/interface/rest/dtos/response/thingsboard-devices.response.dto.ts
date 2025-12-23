import { Device } from 'src/thingsboard/infrastructure/http/thingsboard.api.types';

export type DevicesResponse = {
  data: Device[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
};
