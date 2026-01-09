import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Hl7ProcessingResultDto {
  @ApiProperty({
    description: 'Processing success status',
    type: 'boolean',
  })
  success: boolean;

  @ApiProperty({
    description:
      'HL7 ACK code (AA=Accept, AE=Error, AR=Reject, CR=Commit Reject)',
    type: 'string',
  })
  ackCode: string;

  @ApiProperty({
    description: 'Generated HL7 ACK message',
    type: 'string',
  })
  ackMessage: string;

  @ApiPropertyOptional({
    description: 'Error description if processing failed',
    type: 'string',
  })
  error?: string;

  constructor(data: Partial<Hl7ProcessingResultDto> = {}) {
    this.success = data.success ?? false;
    this.ackCode = data.ackCode ?? 'AE';
    this.ackMessage = data.ackMessage ?? '';
    this.error = data.error;
  }
}
