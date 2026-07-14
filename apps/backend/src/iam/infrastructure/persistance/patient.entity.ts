import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../domain/enums/role.enum';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.PATIENT,
  })
  role: Role;

  @Column({
    type: 'text',
    nullable: true,
    default: null,
  })
  hashedRt: string | null;
}
