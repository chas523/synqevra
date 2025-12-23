export class UserModel {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  hashedRt: string | null;
  connectionId?: number;
}
