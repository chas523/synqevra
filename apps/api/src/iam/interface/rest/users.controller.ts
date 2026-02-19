import { Controller, Get, Req, Query, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Role } from '../../domain/enums/role.enum';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import type { Request } from 'express';
import { CurrentUser } from '../../../auth/types/current-user';
import { UserRepository } from '../../domain/repositories/user.repository';
import { GetUserByTokenUseCase } from '../../application/use-cases/get-user-by-token.use-case';
import { GetUserByTokenResponseDto } from './dto/response/get-user-by-token.response.dto';
import { UserModel } from 'src/iam/domain/entities/user.model';

@ApiTags('Users')
@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UserRepository,
    private readonly getUserByTokenUseCase: GetUserByTokenUseCase,
  ) { }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '(NOT USED YET) Get current user profile',
    description:
      'Retrieve the authenticated user profile without sensitive token data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      example: {
        id: 1,
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  async getProfileById(@Req() req: Request & { user: CurrentUser }) {
    const role = req.user.connectionRole;
    const user = await this.usersService.getUserByIdNoToken(req.user.id);
    return { ...user, role };
  }

  @Roles(Role.ADMIN)
  @Get('getAll')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '(NOT USED) Get all users',
    description: 'Retrieve a list of all users in the system (Admin only)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users retrieved successfully',
    type: UserModel,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'User does not have ADMIN role required to access this endpoint',
  })
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Public()
  @Get('by-token')
  @ApiOperation({
    summary: 'Get user by activation token',
    description:
      'Retrieve user (future practitioner) information using a valid activation token (if exsists). Used to verify practitioner identity during account activation. No authentication required.',
  })
  @ApiQuery({
    name: 'token',
    type: String,
    required: true,
    description: 'User activation token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
    type: GetUserByTokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token is invalid or has expired',
  })
  @ApiResponse({
    status: 410,
    description: 'Token has expired and is no longer valid',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No user found with the provided token',
  })
  async getUserByToken(
    @Query('token') token: string,
  ): Promise<GetUserByTokenResponseDto> {
    return this.getUserByTokenUseCase.execute(token);
  }
}
