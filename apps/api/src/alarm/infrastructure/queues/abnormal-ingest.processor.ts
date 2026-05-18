import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { ProcessAbnormalEventCommand } from '../../application/commands/process-abnormal-event/process-abnormal-event.command';
import { AbnormalEventDto } from '../../application/dto/abnormal-event.dto';
import { ALARM_QUEUE_NAMES } from '../constants/queue.constants';

export interface AbnormalIngestJobData {
  event: AbnormalEventDto;
  source: string;
}

@Injectable()
@Processor(ALARM_QUEUE_NAMES.ABNORMAL_INGEST)
export class AbnormalIngestProcessor extends WorkerHost {
  private readonly logger = new Logger(AbnormalIngestProcessor.name);

  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job<AbnormalIngestJobData>): Promise<void> {
    const { event, source } = job.data;

    this.logger.log(
      `Dequeued abnormal ingest job from Redis/BullMQ: queue=${ALARM_QUEUE_NAMES.ABNORMAL_INGEST}, jobId=${job.id}, source=${source}, tenantId=${event.tenantId}, deviceId=${event.deviceId}, alarmType=${event.alarmType || 'abnormal_telemetry'}, eventId=${event.eventId || 'generated-in-handler'}, dataKeys=${Object.keys(event.data || {}).length}`,
    );

    await this.commandBus.execute(
      new ProcessAbnormalEventCommand(event, source),
    );

    this.logger.debug(
      `Processed abnormal ingest job successfully: queue=${ALARM_QUEUE_NAMES.ABNORMAL_INGEST}, jobId=${job.id}`,
    );
  }
}
