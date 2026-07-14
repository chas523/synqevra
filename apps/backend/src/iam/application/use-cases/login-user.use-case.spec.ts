import { UserRepository } from '../../domain/repositories/user.repository';
import { AuthService } from '../auth/auth.service';
import { LoginUserUseCase } from './login-user.use-case';
import { LoginCommand } from '../dto/login.command';
import { Role } from '../../domain/enums/role.enum';
import type { Response } from 'express';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
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

    useCase = new LoginUserUseCase(
      userRepository as UserRepository,
      tokenService as AuthService,
    );
  });

  // user is validated before reaching this use case
  const command: LoginCommand = {
    userId: 1,
    role: Role.USER,
    response: {} as Response,
  };

  it('should generate access and refresh tokens', async () => {
    await useCase.execute(command);

    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
      command.userId,
    );
    expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(
      command.userId,
    );
    expect(userRepository.updateHashedRt).toHaveBeenCalledTimes(1);

    const [userIdArg, hashedRtArg] =
      userRepository.updateHashedRt.mock.calls[0];

    expect(userIdArg).toBe(command.userId);
    expect(hashedRtArg).toBeDefined();
    expect(typeof hashedRtArg).toBe('string');
  });

  it('should log in user and set cookies', async () => {
    const result = await useCase.execute(command);

    expect(result).toEqual({
      id: command.userId,
      role: command.role,
      success: true,
    });
    expect(tokenService.setTokenCookies).toHaveBeenCalledWith(
      command.response,
      'access-token',
      'refresh-token',
    );
  });
});
