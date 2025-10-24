import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PendingUser } from 'src/entities/pending-user.entity';
import { Repository } from 'typeorm';
import { CreatePendingUserDto } from './dtos/create-pending-user.dto';
import { PaginatedResponse } from './dtos/paginated-response.dto';
import { RequestedAccessUsersRequestOptions } from './dtos/requested-access-users-request-options.dto';

@Injectable()
export class PendingUserService {
  constructor(
    @InjectRepository(PendingUser)
    private readonly userRepository: Repository<PendingUser>,
  ) {}

  async addPendingUser(dto: CreatePendingUserDto): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    const newUser = this.userRepository.create(dto);
    await this.userRepository.save(newUser);
  }

  //there's still some unknown behaviour while sorting via date. i cannot resolve the issue, maybe the date formats are wrongly compared
  async getPendingUserListPaginated(
    options: RequestedAccessUsersRequestOptions,
  ): Promise<PaginatedResponse<PendingUser>> {
    const {
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      limit = 10,
      afterRef,
      beforeRef,
    } = options;

    const allowedSortFields = ['createdAt', 'email'];
    if (!allowedSortFields.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (status) {
      queryBuilder.where('user.status = :status', { status });
    }

    //moving forward - get records AFTER the cursor
    if (afterRef) {
      const cursor = this.decodeCursor(afterRef);
      const cursorValue =
        sortBy === 'createdAt' ? new Date(cursor.value) : cursor.value;

      if (sortOrder === 'desc') {
        if (sortBy === 'createdAt') {
          queryBuilder.andWhere(
            '(user.createdAt < :cursorValue OR (user.createdAt = :cursorValue AND user.id < :cursorId))',
            { cursorValue, cursorId: cursor.id },
          );
        } else {
          queryBuilder.andWhere(
            '(user.email < :cursorValue OR (user.email = :cursorValue AND user.id < :cursorId))',
            { cursorValue, cursorId: cursor.id },
          );
        }
      } else {
        if (sortBy === 'createdAt') {
          queryBuilder.andWhere(
            '(user.createdAt > :cursorValue OR (user.createdAt = :cursorValue AND user.id > :cursorId))',
            { cursorValue, cursorId: cursor.id },
          );
        } else {
          queryBuilder.andWhere(
            '(user.email > :cursorValue OR (user.email = :cursorValue AND user.id > :cursorId))',
            { cursorValue, cursorId: cursor.id },
          );
        }
      }
      //moving backward - get records BEFORE the cursor (reverse the comparison)
    } else if (beforeRef) {
      const cursor = this.decodeCursor(beforeRef);
      const cursorValue =
        sortBy === 'createdAt' ? new Date(cursor.value) : cursor.value;

      if (sortOrder === 'desc') {
        if (sortBy === 'createdAt') {
          queryBuilder.andWhere(
            '(user.createdAt > :cursorValue OR (user.createdAt = :cursorValue AND user.id > :cursorId))',
            { cursorValue, cursorId: cursor.id },
          );
        } else {
          queryBuilder.andWhere(
            '(user.email > :cursorValue OR (user.email = :cursorValue AND user.id > :cursorId))',
            { cursorValue, cursorId: cursor.id },
          );
        }
      } else {
        if (sortBy === 'createdAt') {
          queryBuilder.andWhere(
            '(user.createdAt < :cursorValue OR (user.createdAt = :cursorValue AND user.id < :cursorId))',
            { cursorValue, cursorId: cursor.id },
          );
        } else {
          queryBuilder.andWhere(
            '(user.email < :cursorValue OR (user.email = :cursorValue AND user.id < :cursorId))',
            { cursorValue, cursorId: cursor.id },
          );
        }
      }
    }

    //apply sorting
    if (beforeRef && !afterRef) {
      //for beforeRef, reverse the sort order to get records "before" the cursor at the beginning of the queue (so we can get those + 1 more)
      const reversedOrder = sortOrder === 'asc' ? 'DESC' : 'ASC';
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
    const items = await queryBuilder.limit(Number(limit) + 1).getMany();

    let hasMore = false;
    if (afterRef && !beforeRef) {
      //moving forward - remove last item if we have more than limit
      hasMore = items.length > Number(limit);
      if (hasMore) {
        items.pop(); //remove last item from the end
      }
    } else if (beforeRef && !afterRef) {
      //moving backward - reverse first, then remove first item (the one that came above limit) if we have more than limit
      items.reverse();
      hasMore = items.length > Number(limit);
      if (hasMore) {
        items.shift(); //remove first item (which was originally the last), and now we have items = limit count in the right order
      }
    } else {
      //first load (no refs) - remove last item only if we have more than limit
      hasMore = items.length > Number(limit);
      if (hasMore) {
        items.pop();
      }
    }

    const data = items;

    //get total count
    const totalQueryBuilder = this.userRepository.createQueryBuilder('user');
    if (status) {
      totalQueryBuilder.where('user.status = :status', { status });
    }
    const total = await totalQueryBuilder.getCount();

    let hasNext = false;
    let hasPrev = false;
    let nextCursor: string | undefined;
    let prevCursor: string | undefined;

    if (data.length > 0) {
      const firstItem = data[0];
      const lastItem = data[data.length - 1];

      //code data
      if (!beforeRef && !afterRef) {
        hasNext = hasMore;
        hasPrev = false;
        if (hasNext) {
          nextCursor = this.encodeCursor(lastItem, sortBy);
        }
      } else if (afterRef && !beforeRef) {
        hasNext = hasMore;
        hasPrev = true;
        if (hasNext) {
          nextCursor = this.encodeCursor(lastItem, sortBy);
        }
        prevCursor = this.encodeCursor(firstItem, sortBy);
      } else if (beforeRef && !afterRef) {
        hasPrev = hasMore;
        hasNext = true;
        if (hasPrev) {
          prevCursor = this.encodeCursor(firstItem, sortBy);
        }
        nextCursor = this.encodeCursor(lastItem, sortBy);
      }
    }

    return {
      data,
      pagination: {
        limit,
        hasNext,
        hasPrev,
        nextCursor,
        prevCursor,
      },
      total,
    };
  }

  async getPendingUserById(id: number): Promise<PendingUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('Pending user not found');
    }
    return user;
  }

  async deletePendingUserById(
    id: number,
    customRepo?: Repository<PendingUser>,
  ): Promise<void> {
    const repository = customRepo || this.userRepository;
    const result = await repository.delete(id);
    if (result.affected === 0) {
      throw new BadRequestException('Pending user not found');
    }
  }

  private encodeCursor(item: PendingUser, sortBy: string): string {
    const cursorData = {
      id: item.id,
      value: sortBy === 'createdAt' ? item.createdAt.toISOString() : item.email,
    };
    return JSON.stringify(cursorData);
  }

  private decodeCursor(cursor: string): { id: number; value: string } {
    try {
      const decoded = JSON.parse(cursor) as {
        id: number;
        value: string;
      };
      return {
        id: decoded.id,
        value: decoded.value,
      };
    } catch {
      throw new BadRequestException('Invalid cudrsor format');
    }
  }
}
