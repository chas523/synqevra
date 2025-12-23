import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('activation_links')
export class ActivationLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
  })
  token: string;

  @Column()
  userId: number;

  @OneToOne(() => User, (user) => user.activationLink, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expiresAt: Date | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  tenantId: string;
}
