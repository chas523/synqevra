import { UserModel } from '../entities/user.model';

export abstract class UserRepository {
  abstract getUserByEmail(email: string): Promise<UserModel | null>;
  abstract getUserById(id: number): Promise<UserModel | null>;
  abstract getUserByIdNoToken(id: number): Promise<UserModel | null>;
  abstract save(model: UserModel): Promise<UserModel>;
  abstract updateHashedRt(
    userId: number,
    hashedRt: string | null,
  ): Promise<void>;
  abstract findAll(): Promise<UserModel[]>;
}
