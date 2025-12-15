import { Connection } from 'src/entities/connection.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

@Entity('thingsboard')
export class Thingsboard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  project: string;

  @Column({
    unique: true,
  })
  tenantId: string;

  @Column({ nullable: true })
  accessToken?: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @OneToOne(() => Connection, (connection) => connection.thingsboard)
  connection: Connection;
}
