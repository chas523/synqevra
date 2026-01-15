import { Role } from '../enums/role.enum';

export class AdminModel {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  hashedRt: string | null;
  role: Role;
}
