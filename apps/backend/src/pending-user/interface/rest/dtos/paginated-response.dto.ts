import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetadata {
  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    type: Number,
  })
  limit: number;

  @ApiProperty({
    description: 'Whether there are more items after this page',
    example: false,
    type: Boolean,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there are items before this page',
    example: false,
    type: Boolean,
  })
  hasPrev: boolean;

  @ApiProperty({
    description: 'Cursor to fetch next page',
    example: 'eyJpZCI6IDEwfQ==',
    type: String,
    required: false,
  })
  nextCursor?: string;

  @ApiProperty({
    description: 'Cursor to fetch previous page',
    example: 'eyJpZCI6IDJ9',
    type: String,
    required: false,
  })
  prevCursor?: string;
}

export class PaginatedResponse<T> {
  @ApiProperty({
    description: 'Array of items in this page',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetadata,
  })
  pagination: PaginationMetadata;

  @ApiProperty({
    description: 'Total number of items across all pages',
    example: 42,
    type: Number,
  })
  total: number;
}
