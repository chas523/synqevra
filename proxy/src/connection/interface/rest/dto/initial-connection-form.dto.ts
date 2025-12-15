import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTenantRequestDto } from '../../../../thingsboard/interface/rest/dtos/request/create-tenant.request.dto';
import { CreateTenantAdminRequestDto } from '../../../../thingsboard/interface/rest/dtos/request/create-tenant-admin.request.dto';

export class InitialConnectionFormDto {
  @ApiProperty({ type: CreateTenantRequestDto })
  @ValidateNested()
  @Type(() => CreateTenantRequestDto)
  tenantFields: CreateTenantRequestDto;

  @ApiProperty({ type: CreateTenantAdminRequestDto })
  @ValidateNested()
  @Type(() => CreateTenantAdminRequestDto)
  userFields: CreateTenantAdminRequestDto;
}
