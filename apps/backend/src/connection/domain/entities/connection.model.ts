import { Role } from '../../../iam/domain/enums/role.enum';

export class ConnectionModel {
  id?: number;
  userId: number;
  medplumId?: number;
  thingsboardId?: number;
  role?: Role;
}
