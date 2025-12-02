import { PendingUserStatus } from '../../../domain/enums/status.enum';

export class PendingUserResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: PendingUserStatus;
  createdAt: Date;
  activationToken?: string;
  expiresAt?: Date;
}
