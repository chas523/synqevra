import type { Response } from 'express';
import { Role } from '../../domain/enums/role.enum';

export interface LoginCommand {
  userId: number;
  role: Role;
  response: Response;
}
