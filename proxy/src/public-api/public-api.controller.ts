import { Public } from '../auth/decorators/public.decorator';
import { Queue, QueueEvents } from 'bullmq';
import { Body, Controller, Post, Logger } from '@nestjs/common';
import { QUEUE_NAMES, QUEUE_CONFIG } from 'src/queue/constants/queue.constants';
import {
  buildFallbackAck,
  HL7_ACK_CODES,
} from '../hl7-mapper/constants/hl7.constants';
import { Hl7ProcessingResultDto } from '../hl7-mapper/dto/hl7-processing-result.dto';
import { Hl7ValidationPipe } from '../hl7-mapper/pipes/hl7-validation.pipe';
import { InjectQueue } from '@nestjs/bullmq';
import { HL7ToFHIRPipe } from '../hl7-mapper/pipes/hl7-to-fhir-pipe';
import { FhirMappedResourcesDto } from '../hl7-mapper/dto/fhir-mapped-resources.dto';
@Public()
@Controller('public-api')
export class PublicApiController {
  private readonly logger = new Logger(PublicApiController.name);
  private queueEvents: QueueEvents;

  constructor(
    @InjectQueue(QUEUE_NAMES.HL7_PROCESSING) private hl7Queue: Queue,
  ) {
    this.queueEvents = new QueueEvents(QUEUE_NAMES.HL7_PROCESSING, {
      connection: this.hl7Queue.opts.connection,
    });
  }

  @Post('hl7-decode')
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
