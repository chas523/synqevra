import { UserRepository } from '../../domain/repositories/user.repository';
import { UserModel } from '../../domain/entities/user.model';
import { CreateUserUseCase } from './create-user.use-case';
import { CreateUserCommand } from '../dto/create-user.command';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      getUserByEmail: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    useCase = new CreateUserUseCase(userRepository as UserRepository);
  });

  it('should genSalt and hash method', async () => {
    const command: CreateUserCommand = {
      email: 'existing@example.com',
      password: 'PlainPassword123',
      firstName: 'John',
      lastName: 'Doe',
    };

    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('encodedPassword');

    await useCase.execute(command);

    expect(bcrypt.hash).toHaveBeenCalledWith(command.password, 'salt');
  });

  it('should create a new user when email is not used', async () => {
    const command: CreateUserCommand = {
      email: 'test@example.com',
      password: 'PlainPassword123',
      firstName: 'John',
      lastName: 'Doe',
    };
    const savedUser: UserModel = {
      id: 1,
      email: command.email,
      password: 'encodedPassword',
      firstName: command.firstName,
      lastName: command.lastName,
      hashedRt: null,
    };

    userRepository.getUserByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(savedUser);

    const result = await useCase.execute(command);

    expect(userRepository.getUserByEmail).toHaveBeenCalledWith(command.email);
    expect(userRepository.save).toHaveBeenCalled();

    const savedArg = userRepository.save.mock.calls[0][0];

    expect(savedArg.email).toBe(command.email);
    expect(savedArg.firstName).toBe(command.firstName);
    expect(savedArg.lastName).toBe(command.lastName);
    expect(savedArg.hashedRt).toBeNull();
    expect(savedArg.password).not.toBe(command.password);
    expect(result).toEqual(savedUser);
  });

  it('should throw BadRequestException when email already exists', async () => {
    const command: CreateUserCommand = {
      email: 'existing@example.com',
      password: 'PlainPassword123',
      firstName: 'John',
      lastName: 'Doe',
    };

    const existingUser: UserModel = {
      id: 1,
      email: command.email,
      password: 'some-hash',
      firstName: 'Existing',
      lastName: 'User',
      hashedRt: null,
    };

    userRepository.getUserByEmail.mockResolvedValue(existingUser);

    await expect(useCase.execute(command)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(userRepository.getUserByEmail).toHaveBeenCalledWith(command.email);
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
