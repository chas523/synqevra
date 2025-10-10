import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Connection } from './connection.entity';

@Entity('thingsboard')
export class Thingsboard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  project: string;

  @OneToOne(() => Connection, (connection) => connection.thingsboard)
  connection: Connection;
}
