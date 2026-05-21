import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OutboxStatus } from '../../domain/enums/outbox-status.enum';

@Entity('outbox')
@Index('idx_outbox_worker', ['subscriberType', 'nextAttemptAt'], {
  where: `status IN ('pending', 'retry')`,
})
@Index('idx_outbox_dead', ['tenantId', 'createdAt'], {
  where: `status = 'dead'`,
})
@Index('idx_outbox_aggregate', ['aggregateType', 'aggregateId'])
export class OutboxEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  tenantId: string;

  @Column({ type: 'varchar', length: 100 })
  aggregateType: string;

  @Column({ type: 'varchar', length: 255 })
  aggregateId: string;

  @Column({ type: 'varchar', length: 100 })
  subscriberType: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: OutboxStatus,
    default: OutboxStatus.PENDING,
  })
  status: OutboxStatus;

  @Column({ type: 'smallint', default: 0 })
  attempts: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  nextAttemptAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'text', nullable: true })
  lastError?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
