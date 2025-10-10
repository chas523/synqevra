import {
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Thingsboard } from './thingsboard.entity';
import { Medplum } from './medplum.entity';

@Entity('connections')
@Unique(['user'])
@Index(['user'])
export class Connection {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.connection, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Medplum, (medplum) => medplum.connection, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn({ name: 'medplum_id' })
  medplum?: Medplum | null;

  @OneToOne(() => Thingsboard, (tb) => tb.connection, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn({ name: 'thingsboard_id' })
  thingsboard?: Thingsboard | null;
}
