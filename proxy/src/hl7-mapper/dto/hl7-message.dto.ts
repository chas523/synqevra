import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class Hl7MessageDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  rawMessage: string;
}
