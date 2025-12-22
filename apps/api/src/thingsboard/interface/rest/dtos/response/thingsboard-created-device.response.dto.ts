import { EntityId } from 'src/thingsboard/infrastructure/http/thingsboard.api.types';

export interface Device {
  id: EntityId;
  name: string;
  type: string;
  label: string | null;
  version: number;
  deviceProfileName: string;
  active: boolean;
}
