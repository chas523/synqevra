import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityIdDto, TenantIdDto } from './general-settings.response.dto';

// Submit Strategy Types
export class SubmitStrategyDto {
  @ApiProperty({ example: 'BURST' })
  type:
    | 'BURST'
    | 'BATCH'
    | 'SEQUENTIAL_BY_ORIGINATOR'
    | 'SEQUENTIAL_BY_TENANT'
    | 'SEQUENTIAL';

  @ApiPropertyOptional({ example: 100 })
  batchSize?: number;
}

// Processing Strategy Types
export class ProcessingStrategyDto {
  @ApiProperty({ example: 'RETRY_FAILED_AND_TIMED_OUT' })
  type:
    | 'RETRY_FAILED_AND_TIMED_OUT'
    | 'SKIP_ALL_FAILURES'
    | 'SKIP_ALL_FAILURES_AND_TIMEOUTS'
    | 'RETRY_ALL'
    | 'RETRY_FAILED'
    | 'RETRY_TIMED_OUT';

  @ApiProperty({ example: 3 })
  retries: number;

  @ApiProperty({ example: 0 })
  failurePercentage: number;

  @ApiProperty({ example: 5 })
  pauseBetweenRetries: number;

  @ApiProperty({ example: 5 })
  maxPauseBetweenRetries: number;
}

// Queue DTO
export class QueueDto {
  @ApiProperty({ type: EntityIdDto })
  id: EntityIdDto;

  @ApiProperty({ example: 1761833851343 })
  createdTime: number;

  @ApiProperty({ type: TenantIdDto })
  tenantId: TenantIdDto;

  @ApiProperty({ example: 'Main' })
  name: string;

  @ApiProperty({ example: 'tb_rule_engine.main' })
  topic: string;

  @ApiProperty({ example: 25 })
  pollInterval: number;

  @ApiProperty({ example: 10 })
  partitions: number;

  @ApiProperty({ example: true })
  consumerPerPartition: boolean;

  @ApiProperty({ example: 2000 })
  packProcessingTimeout: number;

  @ApiProperty({ type: SubmitStrategyDto })
  submitStrategy: SubmitStrategyDto;

  @ApiProperty({ type: ProcessingStrategyDto })
  processingStrategy: ProcessingStrategyDto;

  @ApiPropertyOptional({ example: null })
  additionalInfo: any;
}

// Response for fetched queues
export class QueuesPageResponseDto {
  @ApiProperty({ type: [QueueDto] })
  data: QueueDto[];

  @ApiProperty({ example: 1 })
  totalPages: number;

  @ApiProperty({ example: 3 })
  totalElements: number;

  @ApiProperty({ example: false })
  hasNext: boolean;
}
