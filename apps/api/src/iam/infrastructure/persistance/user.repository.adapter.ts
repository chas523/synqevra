import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { EntityManager, Repository } from 'typeorm';
import { UserMapper } from './user.mapper';
import { UserModel } from '../../domain/entities/user.model';

@Injectable()
export class UserRepositoryAdapter extends UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {
    super();
  }

  withManager(manager: EntityManager): UserRepositoryAdapter {
    const repository = manager.getRepository(User);
    return new UserRepositoryAdapter(repository);
  }

  async getUserByEmail(email: string): Promise<UserModel | null> {
    const entity = await this.repository.findOne({
      where: { email },
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async getUserById(id: number): Promise<UserModel | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async getUserByIdNoToken(id: number): Promise<UserModel | null> {
    const entity = await this.repository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'role'],
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async save(model: UserModel): Promise<UserModel> {
    const entity = UserMapper.toOrm(model);
    const saved = await this.repository.save(entity);

    return UserMapper.toDomain(saved);
  }

  async updateHashedRt(userId: number, hashedRt: string | null): Promise<void> {
    await this.repository.update({ id: userId }, { hashedRt: hashedRt });
  }

  async findAll(): Promise<UserModel[]> {
    const users: User[] = await this.repository.find();
    return users.map((user) => UserMapper.toDomain(user));
  }
}
