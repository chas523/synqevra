import { EntityManager } from 'typeorm';
import { AdminRepositoryAdapter } from '../../infrastructure/persistence/admin.repository.adapter';
import { AdminModel } from '../entities/admin.model';

export abstract class AdminRepository {
  abstract withManager(manager: EntityManager): AdminRepositoryAdapter;
  abstract getAdminByEmail(email: string): Promise<AdminModel | null>;
  abstract getAdminById(id: number): Promise<AdminModel | null>;
  abstract getAdminByIdSafe(id: number): Promise<AdminModel | null>;
  abstract updateHashedRt(
    adminId: number,
    hashedRt: string | null,
  ): Promise<void>;
  abstract getAll(): Promise<AdminModel[]>;
  abstract save(model: AdminModel): Promise<AdminModel>;
}
