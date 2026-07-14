import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Connection } from '../../../connection/infrastructure/persistence/connection.entity';
import { ActivationLink } from './activation-link.entity';

@Entity('users')
export class User {
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

  @Column({
    nullable: true,
  })
  password: string;

  @Column({
    type: 'text',
    nullable: true,
    default: null,
  })
  hashedRt: string | null;

  @OneToOne(() => Connection, (connection) => connection.user)
  connection: Connection;

  @OneToOne(() => ActivationLink, (activationLink) => activationLink.user, {
    nullable: true,
  })
  activationLink: ActivationLink;
}
