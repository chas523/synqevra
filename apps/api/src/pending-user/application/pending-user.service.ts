import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { PendingUser } from '../infrastructure/persistence/pending-user.entity';
import { CreatePendingUserDto } from '../interface/rest/dtos/create-pending-user.dto';
import { PaginatedResponse } from '../interface/rest/dtos/paginated-response.dto';
import { RequestedAccessUsersRequestOptions } from './queries/get-pending-user-list-paginated.query/get-pending-user-list-paginated.query';

@Injectable()
export class PendingUserService {
  constructor(
    @InjectRepository(PendingUser)
    private readonly userRepository: Repository<PendingUser>,
  ) {}
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
