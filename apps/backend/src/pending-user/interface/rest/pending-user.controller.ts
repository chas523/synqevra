import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ConflictException as ConflictHttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';

import { CreatePendingUserCommand } from '../../application/commands/create-pending-user/create-pending-user.command';
import { CreatePendingUserDto } from './dtos/create-pending-user.dto';
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
import { PendingUserResponseDto } from './dtos/pending-user.response.dto';

@ApiTags('Pending Users')
@Controller('pending-user')
export class PendingUserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get('/list')
  @ApiOperation({
    summary: 'Get pending users list',
    description:
      'Retrieve a paginated list of pending users with optional filtering and sorting',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of pending users retrieved successfully',
    type: PaginatedResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
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
  @ApiOperation({
    summary: 'Create a pending user',
    description:
      'Register a new pending user account that requires email verification',
  })
  @ApiBody({
    type: CreatePendingUserDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pending user created successfully',
    type: PendingUserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
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
