import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { UpdateUserCommand } from '../dto/update-user.command';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserModel } from '../../domain/entities/user.model';
import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../../infrastructure/constants/user-utils';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UserModel> {
    const { userId, uow, ...updateFields } = command;

    // Sprawdzenie czy użytkownik istnieje
    const existingUser = await uow.userRepository.getUserById(userId);
    if (!existingUser) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }

    // Budowanie obiektu z tylko zdefiniowanymi polami
    const updateData = await this.buildUpdateData(updateFields);

    if (Object.keys(updateData).length === 0) {
      return existingUser; // Jeśli nic do updatowania, zwróć istniejącego usera
    }

    // Merge istniejącego usera z nowymi danymi
    const updatedUser: UserModel = {
      ...existingUser,
      ...updateData,
    };

    return await uow.userRepository.save(updatedUser);
  }

  //creates object with only defined fields (non undefined) and assigns at the end
  private async buildUpdateData(
    fields: Partial<Omit<UpdateUserCommand, 'userId' | 'uow'>>,
  ): Promise<Partial<UserModel>> {
    const updates: Partial<UserModel> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        if (key === 'password') {
          // Hash password if it's being updated
          const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
          const hashedPassword = await bcrypt.hash(value as string, salt);
          (updates as Record<string, unknown>)[key] = hashedPassword;
        } else {
          (updates as Record<string, unknown>)[key] = value;
        }
      }
    }

    return updates;
  }
}
