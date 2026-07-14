import { Public } from '../../../auth/decorators/public.decorator';
import { Queue, QueueEvents } from 'bullmq';
import { Body, Controller, Post, Logger, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import {
  QUEUE_NAMES,
  QUEUE_CONFIG,
} from 'src/hl7/infrastructure/constants/queue.constants';
import {
  buildFallbackAck,
  HL7_ACK_CODES,
} from '../../infrastructure/constants/hl7.constants';
import { Hl7ProcessingResultDto } from '../../application/dto/hl7-processing-result.dto';
import { Hl7ValidationPipe } from '../pipes/hl7-validation.pipe';
import { InjectQueue } from '@nestjs/bullmq';
import { HL7ToFHIRPipe } from '../pipes/hl7-to-fhir-pipe';
import { FhirMappedResourcesDto } from '../../application/dto/fhir-mapped-resources.dto';

@ApiTags('HL7')
@Public()
@Controller()
export class HL7Controller {
  private readonly logger = new Logger(HL7Controller.name);
  private readonly queueEvents: QueueEvents;

  constructor(
    @InjectQueue(QUEUE_NAMES.HL7_PROCESSING) private hl7Queue: Queue,
  ) {
    this.queueEvents = new QueueEvents(QUEUE_NAMES.HL7_PROCESSING, {
      connection: this.hl7Queue.opts.connection,
    });
  }

  @Post('public-api/hl7-decode')
  @ApiOperation({
    summary: 'Process HL7 message and convert to FHIR',
    description:
      'Receive HL7 message, validate and convert to FHIR resources, then process asynchronously. Returns HL7 ACK message.',
  })
  @ApiBody({
    type: String,
    description: 'Raw HL7 message (pipe-delimited format)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'HL7 message processed successfully, returns ACK message (AA=Accept)',
    schema: {
      type: 'string',
      description: 'HL7 ACK message in standard format',
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'HL7 message already processed (duplicate), returns AA ACK code',
    schema: {
      type: 'string',
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid HL7 message format or validation error',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description:
      'Processing timeout or unexpected error, returns AE (Application Error) ACK code',
  })
  async ingest(
    @Body(Hl7ValidationPipe, HL7ToFHIRPipe)
    mappedResources: FhirMappedResourcesDto,
  ) {
    try {
      this.logger.log('Received mapped FHIR resources from pipe');
      this.logger.debug('Mapped resources:', mappedResources);

      if (mappedResources.alreadyProcessed) {
        this.logger.log('Message already processed, returning ACK');
        return buildFallbackAck(HL7_ACK_CODES.AA);
      }

      this.logger.log('Adding mapped resources to processing queue');
      const job = await this.hl7Queue.add(QUEUE_NAMES.HL7_PROCESSING, {
        mappedResources,
      });

      this.logger.log(`Job created with ID: ${job.id}`);

      const result = (await job.waitUntilFinished(
        this.queueEvents,
        QUEUE_CONFIG.JOB_TIMEOUT,
      )) as Hl7ProcessingResultDto;

      this.logger.log('HL7 processing completed successfully');
      this.logger.debug('Processing result:', result);

      if (result.ackMessage) {
        return result.ackMessage;
      }

      return buildFallbackAck(result.ackCode || HL7_ACK_CODES.AE);
    } catch (error) {
      this.logger.error('HL7 processing error:', error);
      return buildFallbackAck(HL7_ACK_CODES.AE);
    }
  }
}
