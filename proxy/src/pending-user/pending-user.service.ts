import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PendingUser,
  PendingUserStatus,
} from 'src/entities/pending-user.entity';
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

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    //filter by status
    if (status !== undefined) {
      queryBuilder.where('user.status = :status', { status });
    }
    //pagination
    if (afterRef) {
      queryBuilder.andWhere('user.id > :afterRef', { afterRef });
    }
    if (beforeRef) {
      queryBuilder.andWhere('user.id < :beforeRef', { beforeRef });
    }

    //sorting
    queryBuilder.orderBy(
      `user.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );

    //totalcount
    const total = await queryBuilder.getCount();

    //get data with limit + 1 to check if there's next page
    const data = await queryBuilder.limit(limit + 1).getMany();
    console.log(data);
    const hasNext = data.length > limit;
    const hasPrev = !!beforeRef || !!afterRef;

    //remove extra item if exists
    if (hasNext) {
      data.pop();
    }

    const nextCursor =
      hasNext && data.length > 0
        ? data[data.length - 1].id.toString()
        : undefined;
    const prevCursor =
      hasPrev && data.length > 0 ? data[0].id.toString() : undefined;

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
}
