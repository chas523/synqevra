import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUserDto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    dto.password = await bcrypt.hash(dto.password, salt);
    const user = this.userRepository.create(dto);
    return await this.userRepository.save(user);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      // select: ['email'],
    });
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }
}
