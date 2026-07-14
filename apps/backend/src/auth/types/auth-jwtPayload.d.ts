import { Role } from '../../iam/domain/enums/role.enum';

export type AuthJwtPayload = {
  sub: number;
  role: Role;
};
