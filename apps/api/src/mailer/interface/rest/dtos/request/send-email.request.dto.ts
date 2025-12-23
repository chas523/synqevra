import type { Address } from 'nodemailer/lib/mailer';
import {
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsString,
  MinLength,
  IsObject,
} from 'class-validator';

export class SendEmailDto {
  @IsOptional()
  @IsObject()
  from?: Address;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  recipients: Address[];

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  subject: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  html: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsObject()
  placeholderReplacements?: Record<string, string>;
}
