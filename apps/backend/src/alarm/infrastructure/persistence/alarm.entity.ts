import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AlarmStatus } from '../../domain/enums/alarm-status.enum';

@Entity('alarms')
@Index('idx_alarms_tenant_status', ['tenantId', 'status', 'updatedAt'])
@Index('idx_alarms_tenant_device', ['tenantId', 'deviceId', 'updatedAt'])
@Index('uq_alarm_open', ['tenantId', 'deviceId', 'alarmType'], {
  unique: true,
  where: `status IN ('OPEN_UNACK', 'OPEN_ACK')`,
})
export class Alarm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  deviceId: string;

  @Column({ type: 'varchar', length: 255 })
  alarmType: string;

  @Column({
    type: 'enum',
    enum: AlarmStatus,
    default: AlarmStatus.OPEN_UNACK,
  })
  status: AlarmStatus;

  @Column({ type: 'varchar', length: 255 })
  lastEventId: string;

  @Column({ type: 'jsonb', nullable: true })
  currentValue?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  thresholdSnapshot?: Record<string, unknown>;

  @Column({ type: 'boolean', default: false })
  suppressed: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  suppressedUntil?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  acknowledgedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  acknowledgedBy?: string;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
