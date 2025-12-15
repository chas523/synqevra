import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateTenantRequestDto } from './create-tenant.request.dto';
import { CreateTenantAdminRequestDto } from './create-tenant-admin.request.dto';

export class RegisterTenantRequestDto {
  @ApiProperty({ type: CreateTenantRequestDto })
  @ValidateNested()
  @Type(() => CreateTenantRequestDto)
  tenantFields: CreateTenantRequestDto;

  @ApiProperty({ type: CreateTenantAdminRequestDto })
  @ValidateNested()
  @Type(() => CreateTenantAdminRequestDto)
  userFields: CreateTenantAdminRequestDto;
}
