import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  TenantFieldsDto,
  UserFieldsDto,
} from '../../../../thingsboard/dtos/thingsboardConnectionForm.dto';

export class InitialConnectionFormDto {
  @ApiProperty({ type: TenantFieldsDto })
  @ValidateNested()
  @Type(() => TenantFieldsDto)
  tenantFields: TenantFieldsDto;

  @ApiProperty({ type: UserFieldsDto })
  @ValidateNested()
  @Type(() => UserFieldsDto)
  userFields: UserFieldsDto;
}
