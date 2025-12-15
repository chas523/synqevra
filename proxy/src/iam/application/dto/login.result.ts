import { Role } from '../../domain/enums/role.enum';

export interface LoginResult {
  id: number;
  role: Role;
  success: boolean;
}
