import { LogoutUserUseCase } from './logout-user.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { AuthService } from '../auth/auth.service';
import type { Response } from 'express';
import { LogoutCommand } from '../dto/logout.command';

describe('LogoutUserUseCase', () => {
  let useCase: LogoutUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    userRepository = {
      updateHashedRt: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    authService = {
      clearAuthCookies: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    useCase = new LogoutUserUseCase(
      userRepository as UserRepository,
      authService as AuthService,
    );
  });

  const responseMock = {
    clearCookie: jest.fn(),
  } as unknown as Response;
  const command: LogoutCommand = {
    userId: 1,
    response: responseMock,
  };

  it('should set refresh token as null in database', async () => {
    await useCase.execute(command);

    expect(userRepository.updateHashedRt).toHaveBeenCalledTimes(1);
    expect(userRepository.updateHashedRt).toHaveBeenCalledWith(
      command.userId,
      null,
    );
  });

  it('should clear auth cookies', async () => {
    await useCase.execute(command);

    expect(authService.clearAuthCookies).toHaveBeenCalledTimes(1);
    expect(authService.clearAuthCookies).toHaveBeenCalledWith(responseMock);
  });
});
