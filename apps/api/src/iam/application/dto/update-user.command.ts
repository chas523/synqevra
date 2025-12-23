import { Role } from '../../domain/enums/role.enum';

export class UpdateUserCommand {
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: Role;
  hashedRt?: string | null;
}
