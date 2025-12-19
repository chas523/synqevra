import { Role } from '../enums/role.enum';

export class UserModel {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  hashedRt: string | null;
  role?: Role;
  connectionId?: number;
}
