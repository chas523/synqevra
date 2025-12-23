import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Connection } from '../../../connection/infrastructure/persistance/connection.entity';

@Entity('thingsboard')
export class Thingsboard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  project: string;

  @Column()
  tenantId: string;

  @Column({ nullable: true })
  accessToken?: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @OneToOne(() => Connection, (connection) => connection.thingsboard)
  connection: Connection;
}
