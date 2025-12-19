export class Hl7ProcessingResultDto {
  success: boolean;
  ackCode: string;
  ackMessage: string;
  error?: string;

  constructor(data: Partial<Hl7ProcessingResultDto> = {}) {
    this.success = data.success ?? false;
    this.ackCode = data.ackCode ?? 'AE';
    this.ackMessage = data.ackMessage ?? '';
    this.error = data.error;
  }
}
