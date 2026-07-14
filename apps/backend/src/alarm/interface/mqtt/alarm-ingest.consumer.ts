import { connect, MqttClient } from 'mqtt';
import { InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Queue } from 'bullmq';

import { AbnormalEventDto } from '../../application/dto/abnormal-event.dto';
import {
  ALARM_QUEUE_NAMES,
  ALARM_QUEUE_SETTINGS,
} from '../../infrastructure/constants/queue.constants';

@Injectable()
export class AlarmIngestConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AlarmIngestConsumer.name);
  private client?: MqttClient;

  constructor(
    @InjectQueue(ALARM_QUEUE_NAMES.ABNORMAL_INGEST)
    private readonly abnormalIngestQueue: Queue,
  ) {}

  onModuleInit(): void {
    if (process.env.ALARM_MQTT_INGEST_ENABLED !== 'true') {
      this.logger.log('Alarm MQTT ingest is disabled by configuration.');
      return;
    }

    const brokerUrl =
      process.env.ALARM_MQTT_BROKER_URL || 'mqtt://localhost:1883';
    const topic = process.env.ALARM_MQTT_TOPIC || 'tb/abnormal/events';

    this.client = connect(brokerUrl, {
      clientId:
        process.env.ALARM_MQTT_CLIENT_ID ||
        `api-alarm-ingest-${Math.random().toString(16).slice(2, 10)}`,
      reconnectPeriod: 2000,
    });

    this.client.on('connect', () => {
      this.logger.log(`Connected to MQTT broker: ${brokerUrl}`);
      this.client?.subscribe(topic, { qos: 1 }, (error) => {
        if (error) {
          this.logger.error('Failed to subscribe to alarm topic', error);
          return;
        }
        this.logger.log(`Subscribed to topic: ${topic}`);
      });
    });

    this.client.on('message', (messageTopic, payloadBuffer) => {
      void this.handleMessage(messageTopic, payloadBuffer.toString('utf-8'));
    });

    this.client.on('error', (error) => {
      this.logger.error('MQTT ingest client error', error);
    });
  }

  onModuleDestroy(): void {
    if (this.client) {
      this.client.end(true);
    }
  }

  private async handleMessage(topic: string, payload: string): Promise<void> {
    try {
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      const normalized = this.normalizePayload(parsed);

      const dto = plainToInstance(AbnormalEventDto, normalized);
      const errors = await validate(dto);

      if (errors.length > 0) {
        this.logger.warn(`Invalid abnormal event payload: ${payload}`);
        return;
      }

      this.logger.log(
        `MQTT abnormal ingest received: topic=${topic}, tenantId=${dto.tenantId}, deviceId=${dto.deviceId}, alarmType=${dto.alarmType || 'abnormal_telemetry'}, eventId=${dto.eventId || 'generated-later'}, dataKeys=${Object.keys(dto.data || {}).length}`,
      );

      const job = await this.abnormalIngestQueue.add(
        ALARM_QUEUE_NAMES.ABNORMAL_INGEST,
        {
          event: dto,
          source: topic,
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
        `Enqueued abnormal ingest job to Redis/BullMQ: queue=${ALARM_QUEUE_NAMES.ABNORMAL_INGEST}, jobId=${job.id}, source=${topic}`,
      );
    } catch (error) {
      this.logger.error('Failed to process MQTT abnormal event', error);
    }
  }

  private normalizePayload(raw: Record<string, unknown>): AbnormalEventDto {
    const eventId = this.toStringValue(raw.eventId ?? raw.event_id);
    const tenantId = this.toStringValue(raw.tenantId ?? raw.tenant_id);
    const deviceId = this.toStringValue(raw.deviceId ?? raw.device_id);
    const alarmType =
      this.toStringValue(raw.alarmType ?? raw.alarm_type) ||
      'abnormal_telemetry';
    const ts = this.toStringValue(raw.ts);

    return {
      eventId,
      tenantId,
      deviceId,
      alarmType,
      data: (raw.data as Record<string, unknown>) ?? {},
      thresholdSnapshot:
        (raw.thresholdSnapshot as Record<string, unknown>) ??
        (raw.threshold as Record<string, unknown>) ??
        {},
      ts: ts || undefined,
      metadata: (raw.metadata as Record<string, unknown>) ?? {},
    };
  }

  private toStringValue(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return '';
  }
}
