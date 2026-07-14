import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../iam/infrastructure/persistence/user.entity';
import { Thingsboard } from '../../../thingsboard/infrastructure/persistence/thingsboard.entity';
import { Medplum } from '../../../medplum/infrastructure/persistence/medplum.entity';
import { Role } from '../../../iam/domain/enums/role.enum';

@Entity('connections')
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

  @ManyToOne(() => Medplum, (medplum) => medplum.connection, {
    nullable: true,
  })
  @JoinColumn({ name: 'medplum_id' })
  medplum?: Medplum | null;

  @OneToOne(() => Thingsboard, (tb) => tb.connection, {
    nullable: true,
    cascade: ['insert', 'update', 'remove'],
  })
  @JoinColumn({ name: 'thingsboard_id' })
  thingsboard?: Thingsboard | null;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.MODERATOR,
  })
  role: Role;
}
