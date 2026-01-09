import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, IsString, Min } from 'class-validator';
import { PendingUserStatus } from 'src/pending-user/domain/enums/status.enum';
import { Type } from 'class-transformer';

export class RequestedAccessUsersRequestOptions {
  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
    type: String,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order direction',
    enum: ['asc', 'desc'],
    example: 'desc',
    type: String,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Filter by user status',
    enum: PendingUserStatus,
    example: PendingUserStatus.NEW,
    type: String,
  })
  @IsOptional()
  @IsEnum(PendingUserStatus)
  status?: PendingUserStatus;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Cursor for pagination - fetch items after this cursor',
    example: 'eyJpZCI6IDEwfQ==',
    type: String,
  })
  @IsOptional()
  @IsString()
  afterRef?: string;

  @ApiPropertyOptional({
    description: 'Cursor for pagination - fetch items before this cursor',
    example: 'eyJpZCI6IDJ9',
    type: String,
  })
  @IsOptional()
  @IsString()
  beforeRef?: string;

  [key: string]: unknown;
}
