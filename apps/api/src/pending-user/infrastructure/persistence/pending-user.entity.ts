import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PendingUserStatus } from '../../domain/enums/status.enum';

@Entity('pending_users')
export class PendingUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    unique: true,
  })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: PendingUserStatus,
    default: PendingUserStatus.NEW,
  })
  status: PendingUserStatus;

  @Column({ unique: true, nullable: true })
  activationToken?: string;

  @Column({ nullable: true })
  expiresAt?: Date;
}
