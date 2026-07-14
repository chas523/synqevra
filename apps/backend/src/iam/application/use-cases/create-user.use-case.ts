import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserCommand } from '../dto/create-user.command';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserModel } from '../../domain/entities/user.model';
import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../../infrastructure/constants/user-utils';
import { UnitOfWork } from '../../../connection/infrastructure/transaction/unit-of-work';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<UserModel> {
    const { email, password } = command;

    const existingUser = await this.userRepository.getUserByEmail(email);
    if (existingUser) {
      throw new BadRequestException(`User with email already exists`);
    }

    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    const model: UserModel = {
      ...command,
      password: hashedPassword,
      hashedRt: null,
    };

    return await this.userRepository.save(model);
  }

  async executeWithUOW(
    command: CreateUserCommand,
    uow: UnitOfWork,
  ): Promise<UserModel> {
    const { email, password } = command;

    const existingUser = await uow.userRepository.getUserByEmail(email);
    if (existingUser) {
      throw new BadRequestException(`User with email already exists`);
    }

    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    const model: UserModel = {
      ...command,
      password: hashedPassword,
      hashedRt: null,
    };

    return await uow.userRepository.save(model);
  }
}
