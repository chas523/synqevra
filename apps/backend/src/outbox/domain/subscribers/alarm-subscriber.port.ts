import { OutboxEvent } from '../../infrastructure/persistence/outbox-event.entity';

import { SubscriberType } from './subscriber-type.enum';

export interface AlarmSubscriber {
  readonly type: SubscriberType;
  deliver(event: OutboxEvent): Promise<void>;
}
