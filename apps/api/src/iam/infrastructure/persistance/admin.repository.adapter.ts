import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../../domain/repositories/admin.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { EntityManager, Repository } from 'typeorm';
import { AdminModel } from 'src/iam/domain/entities/admin.model';
import { AdminMapper } from './admin.mapper';

@Injectable()
export class AdminRepositoryAdapter extends AdminRepository {
  constructor(
    @InjectRepository(Admin)
    private readonly repository: Repository<Admin>,
  ) {
    super();
  }

  withManager(manager: EntityManager): AdminRepositoryAdapter {
    const repository = manager.getRepository(Admin);
    return new AdminRepositoryAdapter(repository);
  }

  async getAdminByEmail(email: string): Promise<AdminModel | null> {
    const entity = await this.repository.findOne({
      where: { email },
    });

    return entity ? AdminMapper.toDomain(entity) : null;
  }

  async getAdminById(id: number): Promise<AdminModel | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    return entity ? AdminMapper.toDomain(entity) : null;
  }

  async getAdminByIdSafe(id: number): Promise<AdminModel | null> {
    const entity = await this.repository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'role'],
    });

    return entity ? AdminMapper.toDomain(entity) : null;
  }

  async updateHashedRt(
    adminId: number,
    hashedRt: string | null,
  ): Promise<void> {
    await this.repository.update({ id: adminId }, { hashedRt: hashedRt });
  }

  async getAll(): Promise<AdminModel[]> {
    const entities = await this.repository.find();
    return entities.map((admin) => AdminMapper.toDomain(admin));
  }

  async save(model: AdminModel): Promise<AdminModel> {
    try {
      const entity = AdminMapper.toOrm(model);
      const saved = await this.repository.save(entity);
      return AdminMapper.toDomain(saved);
    } catch (error) {
      console.error('Error saving Admin entity:', error);
      throw error;
    }
  }
}
