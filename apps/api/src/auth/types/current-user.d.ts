import { Role } from '../../iam/domain/enums/role.enum';

export type CurrentUser = {
  id: number;
  connectionRole: Role;
};
