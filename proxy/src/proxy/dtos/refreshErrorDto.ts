import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class RefreshErrorDto {
  @ApiProperty({
    description: 'Error message',
    type: String,
  })
  @Expose()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Error name',
    type: String,
  })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Error code',
    type: String,
  })
  @Expose()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Status',
    type: String,
  })
  @Expose()
  @IsNumber()
  status: number;
}
