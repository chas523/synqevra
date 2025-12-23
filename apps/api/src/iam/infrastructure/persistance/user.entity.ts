import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Connection } from '../../../connection/infrastructure/persistance/connection.entity';
import { Role } from '../../domain/enums/role.enum';
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

  @Column()
  password: string;

  @Column({
    type: 'text',
    nullable: true,
    default: null,
  })
  hashedRt: string | null;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.MODERATOR,
  })
  role: Role;

  @OneToOne(() => Connection, (connection) => connection.user)
  connection: Connection;

  @OneToOne(() => ActivationLink, (activationLink) => activationLink.user, {
    nullable: true,
  })
  activationLink: ActivationLink;
}
