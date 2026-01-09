import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDeviceRequestDto {
  @ApiProperty({
    description: 'Device identifier',
    example: 'DEVICE-001',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    description: 'Reference to patient in FHIR format',
    example: 'Patient/12345',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  patientRef: string;
}
