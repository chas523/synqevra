import { Role } from '../enums/role.enum';

export class PatientModel {
  id?: number;
  email: string;
  password?: string;
  role: Role;
  hashedRt: string | null;
}
