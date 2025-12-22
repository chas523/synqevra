import { RegisterUserUseCase } from './register-user.use-case';
import { CreateUserUseCase } from './create-user.use-case';
import { AuthService } from '../auth/auth.service';
import { RegisterUserCommand } from '../dto/register-user.command';
import type { Response } from 'express';
import { UserModel } from '../../domain/entities/user.model';
import { InternalServerErrorException } from '@nestjs/common';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let tokenService: jest.Mocked<AuthService>;

  const userId = 1;
  const userData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@email.com',
    password: 'password',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    createUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateUserUseCase>;

    tokenService = {
      generateAccessToken: jest.fn().mockResolvedValue('access-token'),
      generateRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
      setTokenCookies: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    useCase = new RegisterUserUseCase(
      createUserUseCase as CreateUserUseCase,
      tokenService as AuthService,
    );
  });

  const command: RegisterUserCommand = {
    createUserDto: userData,
    response: {} as Response,
  };

  it('should create user', async () => {
    jest
      .spyOn(createUserUseCase, 'execute')
      .mockResolvedValueOnce({ ...userData, id: userId } as UserModel);

    const result = await useCase.execute(command);

    expect(createUserUseCase.execute).toHaveBeenCalledWith(userData);

    expect(result).toEqual({
      id: userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
    });
  });

  it('should create and save tokens', async () => {
    jest
      .spyOn(createUserUseCase, 'execute')
      .mockResolvedValueOnce({ ...userData, id: userId } as UserModel);

    await useCase.execute(command);

    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(userId);
    expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(userId);
    expect(tokenService.setTokenCookies).toHaveBeenCalledWith(
      command.response,
      'access-token',
      'refresh-token',
    );
  });

  it('should throw exception if user was not created', async () => {
    jest
      .spyOn(createUserUseCase, 'execute')
      .mockResolvedValueOnce({} as UserModel);

    await expect(useCase.execute(command)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
