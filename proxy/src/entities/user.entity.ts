import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Connection } from './connection.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToOne(() => Connection, (connection) => connection.user)
  connection: Connection;
}
