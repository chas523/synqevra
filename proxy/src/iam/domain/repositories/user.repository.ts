import { UserModel } from '../entities/user.model';
import { EntityManager } from 'typeorm';
import { UserRepositoryAdapter } from '../../infrastructure/persistance/user.repository.adapter';

export abstract class UserRepository {
  abstract withManager(manager: EntityManager): UserRepositoryAdapter;
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
