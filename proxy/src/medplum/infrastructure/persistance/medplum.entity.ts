import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Connection } from '../../../connection/infrastructure/persistance/connection.entity';

@Entity('medplum')
export class Medplum {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  client_id: string;

  @Column()
  client_secret: string;

  @OneToOne(() => Connection, (connection) => connection.medplum)
  connection: Connection;
}
