import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class ObservationRequestDto {
  @ApiProperty({
    description: 'Payload containing FHIR data',
    required: true,
    type: Object,
  })
  @IsObject()
  payload: Record<string, any>;

  @ApiProperty({
    description: 'Encrypted Refresh Token',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
