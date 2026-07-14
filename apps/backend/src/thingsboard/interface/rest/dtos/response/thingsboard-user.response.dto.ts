import { ApiProperty } from '@nestjs/swagger';

class EntityId {
  @ApiProperty({
    example: 'USER',
    description: 'Type of entity',
  })
  entityType: string;

  @ApiProperty({
    example: 'uuid-string',
    description: 'Unique identifier',
  })
  id: string;
}
export class ThingsboardUserResponseDto {
  @ApiProperty({
    type: EntityId,
    example: { entityType: 'USER', id: 'uuid-string' },
  })
  id: {
    entityType: string;
    id: string;
  };
  @ApiProperty({
    description: 'Timestamp when user was created',
    example: 1609459200000,
  })
  createdTime: number;
  @ApiProperty({
    type: EntityId,
    example: { entityType: 'TENANT', id: 'uuid-string' },
  })
  tenantId: {
    entityType: string;
    id: string;
  };
  @ApiProperty({
    type: EntityId,
    example: { entityType: 'CUSTOMER', id: 'uuid-string' },
  })
  customerId: {
    entityType: string;
    id: string;
  };
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;
  @ApiProperty({
    example: 'John',
    description: 'User first name',
    nullable: true,
  })
  firstName?: string;
  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    nullable: true,
  })
  lastName?: string;
  @ApiProperty({
    example: '+1234567890',
    description: 'User phone number',
    nullable: true,
  })
  phone?: string;
  @ApiProperty({
    example: 'TENANT_ADMIN',
    description: 'User authority/role',
  })
  authority: string;
  @ApiProperty({
    description: 'Additional user information as key-value pairs',
  })
  additionalInfo?: Record<string, any>;
}
