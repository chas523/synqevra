import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Queue } from 'bullmq';

import { Public } from '../../../auth/decorators/public.decorator';
import { AbnormalEventDto } from '../../application/dto/abnormal-event.dto';
import {
  ALARM_QUEUE_NAMES,
  ALARM_QUEUE_SETTINGS,
} from '../../infrastructure/constants/queue.constants';

@Public()
@SkipThrottle()
@Controller('alarm')
export class AlarmIngestController {
  private readonly logger = new Logger(AlarmIngestController.name);

  constructor(
    @InjectQueue(ALARM_QUEUE_NAMES.ABNORMAL_INGEST)
    private readonly abnormalIngestQueue: Queue,
  ) {}

  @Post('abnormal-events')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Ingest abnormal events',
    description:
      'Primary abnormal events ingestion endpoint for ThingsBoard Rule Chain. Event is enqueued to Redis/BullMQ for internal processing.',
  })
  async ingestAbnormalEvent(
    @Body(ValidationPipe) dto: AbnormalEventDto,
  ): Promise<void> {
    this.logger.log(
      `HTTP abnormal ingest received: tenantId=${dto.tenantId}, deviceId=${dto.deviceId}, alarmType=${dto.alarmType || 'abnormal_telemetry'}, eventId=${dto.eventId || 'generated-later'}, dataKeys=${Object.keys(dto.data || {}).length}`,
    );

    const job = await this.abnormalIngestQueue.add(
      ALARM_QUEUE_NAMES.ABNORMAL_INGEST,
      {
        event: dto,
        source: 'http',
      },
      {
        attempts: ALARM_QUEUE_SETTINGS.JOB_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: ALARM_QUEUE_SETTINGS.BACKOFF_DELAY_MS,
        },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    );

    this.logger.debug(
      `Enqueued abnormal ingest job to Redis/BullMQ: queue=${ALARM_QUEUE_NAMES.ABNORMAL_INGEST}, jobId=${job.id}, source=http`,
    );
  }
}
