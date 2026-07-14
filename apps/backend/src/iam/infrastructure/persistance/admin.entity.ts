import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../domain/enums/role.enum';

@Entity('admins')
export class Admin {
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
    default: Role.ADMIN,
  })
  role: Role;
}
