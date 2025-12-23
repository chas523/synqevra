import { RefreshTokensUseCase } from './refresh-token.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { AuthService } from '../auth/auth.service';
import { RefreshTokensCommand } from '../dto/refresh-token.command';
import type { Response } from 'express';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokensUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenService: jest.Mocked<AuthService>;

  beforeEach(() => {
    userRepository = {
      updateHashedRt: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    tokenService = {
      generateAccessToken: jest.fn().mockResolvedValue('access-token'),
      generateRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
      setTokenCookies: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    useCase = new RefreshTokensUseCase(
      userRepository as UserRepository,
      tokenService as AuthService,
    );
  });

  const command: RefreshTokensCommand = {
    userId: 1,
    response: {} as Response,
  };

  it('should generate and set tokens', async () => {
    const result = await useCase.execute(command);
    const [userIdArg, hashedRtArg] =
      userRepository.updateHashedRt.mock.calls[0];

    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
      command.userId,
    );
    expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(
      command.userId,
    );
    expect(userRepository.updateHashedRt).toHaveBeenCalledTimes(1);

    expect(userIdArg).toBe(command.userId);
    expect(hashedRtArg).toBeDefined();
    expect(typeof hashedRtArg).toBe('string');

    expect(tokenService.setTokenCookies).toHaveBeenCalledWith(
      command.response,
      'access-token',
      'refresh-token',
    );

    expect(result).toEqual({
      id: command.userId,
      success: true,
    });
  });
});
