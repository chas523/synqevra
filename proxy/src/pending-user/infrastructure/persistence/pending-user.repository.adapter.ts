import { Injectable } from '@nestjs/common';
import {
  PaginationCursorPrimitive,
  PaginationPrimitiveSortBy,
  PendingUserRepositoryPort,
} from '../../application/ports/pending-user.repository.port';
import { PendingUserModel } from '../../domain/models/pending-user.model';
import { PendingUserStatus } from '../../domain/enums/status.enum';
import { PendingUserMapper } from './pending-user.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { PendingUser } from './pending-user.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class PendingUserRepositoryAdapter implements PendingUserRepositoryPort {
  constructor(
    @InjectRepository(PendingUser)
    private readonly repository: Repository<PendingUser>,
  ) {}

  async save(pendingUser: PendingUserModel): Promise<PendingUserModel> {
    const pendingUserOrmEntity = PendingUserMapper.toOrm(pendingUser);
    const saved = await this.repository.save(pendingUserOrmEntity);

    return PendingUserMapper.toDomain(saved);
  }

  async update(pendingUser: PendingUserModel): Promise<void> {
    const pendingUserOrmEntity = PendingUserMapper.toOrm(pendingUser);
    await this.repository.update(
      { id: pendingUser.getId() },
      pendingUserOrmEntity,
    );
  }

  async findByEmail(email: string): Promise<PendingUserModel | null> {
    const pendingUserOrm = await this.repository.findOne({ where: { email } });
    if (!pendingUserOrm) {
      return null;
    }
    return PendingUserMapper.toDomain(pendingUserOrm);
  }
  async findById(id: number): Promise<PendingUserModel | null> {
    const pendingUserOrm = await this.repository.findOne({ where: { id } });
    if (!pendingUserOrm) {
      return null;
    }
    return PendingUserMapper.toDomain(pendingUserOrm);
  }
  async findForPagination(
    status: PendingUserStatus | undefined,
    sortBy: PaginationPrimitiveSortBy,
    sortOrder: 'asc' | 'desc',
    after: PaginationCursorPrimitive | null,
    before: PaginationCursorPrimitive | null,
    limit: number,
  ): Promise<{
    items: PendingUserModel[];
    hasMore: boolean;
    total: number;
  }> {
    const queryBuilder = this.repository.createQueryBuilder('user');

    if (status) {
      queryBuilder.where('user.status = :status', { status });
    }

    //moving forward - get records AFTER the cursor
    if (after) {
      const cursorValue =
        sortBy === 'createdAt' ? new Date(after.value) : after.value;

      if (sortOrder === 'desc') {
        if (sortBy === 'createdAt') {
          queryBuilder.andWhere(
            '(user.createdAt < :cursorValue OR (user.createdAt = :cursorValue AND user.id < :cursorId))',
            { cursorValue, cursorId: after.id },
          );
        } else {
          queryBuilder.andWhere(
            '(user.email < :cursorValue OR (user.email = :cursorValue AND user.id < :cursorId))',
            { cursorValue, cursorId: after.id },
          );
        }
      } else {
        if (sortBy === 'createdAt') {
          queryBuilder.andWhere(
            '(user.createdAt > :cursorValue OR (user.createdAt = :cursorValue AND user.id > :cursorId))',
            { cursorValue, cursorId: after.id },
          );
        } else {
          queryBuilder.andWhere(
            '(user.email > :cursorValue OR (user.email = :cursorValue AND user.id > :cursorId))',
            { cursorValue, cursorId: after.id },
          );
        }
      }
      //moving backward - get records BEFORE the cursor (reverse the comparison)
    } else if (before) {
      const cursorValue =
        sortBy === 'createdAt' ? new Date(before.value) : before.value;

      if (sortOrder === 'desc') {
        if (sortBy === 'createdAt') {
          queryBuilder.andWhere(
            '(user.createdAt > :cursorValue OR (user.createdAt = :cursorValue AND user.id > :cursorId))',
            { cursorValue, cursorId: before.id },
          );
        } else {
          queryBuilder.andWhere(
            '(user.email > :cursorValue OR (user.email = :cursorValue AND user.id > :cursorId))',
            { cursorValue, cursorId: before.id },
          );
        }
      } else {
        if (sortBy === 'createdAt') {
          queryBuilder.andWhere(
            '(user.createdAt < :cursorValue OR (user.createdAt = :cursorValue AND user.id < :cursorId))',
            { cursorValue, cursorId: before.id },
          );
        } else {
          queryBuilder.andWhere(
            '(user.email < :cursorValue OR (user.email = :cursorValue AND user.id < :cursorId))',
            { cursorValue, cursorId: before.id },
          );
        }
      }
    }

    //apply sorting
    if (before && !after) {
      //for beforeRef, reverse the sort order to get records "before" the cursor at the beginning of the queue (so we can get those + 1 more)
      const reversedOrder: 'ASC' | 'DESC' =
        sortOrder === 'asc' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`user.${sortBy}`, reversedOrder);
      queryBuilder.addOrderBy('user.id', reversedOrder);
    } else {
      //normal sorting for first load and afterRef
      queryBuilder.orderBy(
        `user.${sortBy}`,
        sortOrder.toUpperCase() as 'ASC' | 'DESC',
      );
      queryBuilder.addOrderBy(
        'user.id',
        sortOrder.toUpperCase() as 'ASC' | 'DESC',
      );
    }
    //get one more item than limit to check if there are more pages
    const ormItems = await queryBuilder.limit(Number(limit) + 1).getMany();

    let hasMore = ormItems.length > Number(limit);
    if (after && !before) {
      //moving forward - remove last item if we have more than limit
      if (hasMore) {
        ormItems.pop(); //remove last item from the end
      }
    } else if (before && !after) {
      //moving backward - reverse first, then remove first item (the one that came above limit) if we have more than limit
      ormItems.reverse();
      hasMore = ormItems.length > Number(limit);
      if (hasMore) {
        ormItems.shift(); //remove first item (which was originally the last), and now we have items = limit count in the right order
      }
    } else {
      //first load (no refs) - remove last item only if we have more than limit
      if (hasMore) {
        ormItems.pop();
      }
    }

    const items = ormItems.map((orm) => PendingUserMapper.toDomain(orm));

    //get total count
    const totalQueryBuilder = this.repository.createQueryBuilder('user');
    if (status) {
      totalQueryBuilder.where('user.status = :status', { status });
    }
    const total = await totalQueryBuilder.getCount();

    return { items, hasMore, total };
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  withManager(manager: EntityManager): PendingUserRepositoryAdapter {
    const repository = manager.getRepository(PendingUser);
    return new PendingUserRepositoryAdapter(repository);
  }
}
