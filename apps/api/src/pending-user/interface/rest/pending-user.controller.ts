import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ConflictException as ConflictHttpException,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';

import { CreatePendingUserCommand } from '../../application/commands/create-pending-user/create-pending-user.command';
import type { CreatePendingUserDto } from './dtos/create-pending-user.dto';
import { PendingUserModel } from '../../domain/models/pending-user.model';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { match, type Result } from 'oxide.ts';
import { UserAlreadyExistsError } from '../../domain/errors/pending-user.errors';
import type { RequestedAccessUsersRequestOptions } from './dtos/requested-access-users-request-options.dto';
import {
  GetPendingUserListPaginatedQuery,
  PaginationQueryErrors,
} from '../../application/queries/get-pending-user-list-paginated.query/get-pending-user-list-paginated.query';
import { PaginatedResponse } from './dtos/paginated-response.dto';
import { PendingUserResponseMapper } from './mappers/pending-user-response.mapper';

@Controller('pending-user')
export class PendingUserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get('/list')
  async getPendingUserList(
    @Query() options: RequestedAccessUsersRequestOptions,
  ) {
    const query = new GetPendingUserListPaginatedQuery(options);
    const result: Result<
      PaginatedResponse<PendingUserModel>,
      PaginationQueryErrors
    > = await this.queryBus.execute(query);

    return match(result, {
      Ok: (paginatedResult: PaginatedResponse<PendingUserModel>) => ({
        ...paginatedResult,
        data: PendingUserResponseMapper.toDtoBatch(paginatedResult.data),
      }),
      Err: (error: Error) => {
        if (error instanceof UserAlreadyExistsError)
          throw new ConflictHttpException(error.message);
        throw error;
      },
    });
  }

  @Public()
  @Post('/create')
  async createPendingUser(@Body() pendingUserDto: CreatePendingUserDto) {
    const command = new CreatePendingUserCommand(pendingUserDto);
    const result: Result<PendingUserModel, UserAlreadyExistsError> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (model: PendingUserModel) => PendingUserResponseMapper.toDto(model),
      Err: (error: Error) => {
        if (error instanceof UserAlreadyExistsError)
          throw new ConflictHttpException(error.message);
        throw error;
      },
    });
  }
}
