import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../infrastructure/persistance/user.entity';
import { Repository } from 'typeorm';
import { CreateUserCommand } from '../dto/create-user.command';
import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../../infrastructure/constants/user-utils';

// Service should be deleted after creating DDD for connection
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(
    command: CreateUserCommand,
    repo?: Repository<User>,
  ): Promise<User> {
    const repository = repo || this.userRepository;
    const existingUser = await repository.findOne({
      where: { email: command.email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(command.password, salt);

    const user = repository.create({
      ...command,
      password: hashedPassword,
    });

    return await repository.save(user);
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'hashedRt'],
    });

    return user;
  }
}
