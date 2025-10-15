import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUserDto';
import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from './constants/user-utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(dto.password, salt);
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'hashedRt'],
    });
    console.log('user', user);
    return user;
  }

  async getUserByIdNoToken(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'role'],
    });
    console.log('user', user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    console.log(await bcrypt.hash('x', 10));
    return await this.userRepository.find();
  }

  async updateHashedRt(userId: number, hashedRt: string | null) {
    return await this.userRepository.update(
      { id: userId },
      { hashedRt: hashedRt },
    );
  }
}
