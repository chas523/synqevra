import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('idempotency_keys')
@Index('uq_idempotency_tenant_event', ['tenantId', 'eventId'], { unique: true })
@Index('idx_idempotency_processed_at', ['processedAt'])
export class IdempotencyKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  eventId: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  sourceTopic?: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  payloadHash?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  firstSeenAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt?: Date;
}
