import { ValidateTokenUseCase } from './validate-token.use-case';
import { PendingUserRepositoryPort } from '../../../pending-user/application/ports/pending-user.repository.port';
import { PendingUserStatus } from '../../../pending-user/domain/enums/status.enum';
import {
  GoneException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PendingUserModel } from '../../../pending-user/domain/models/pending-user.model';

describe('ValidateTokenUseCase', () => {
  let useCase: ValidateTokenUseCase;
  let repository: jest.Mocked<PendingUserRepositoryPort>;

  const buildToken = (
    userId: number,
    prefix = 'nonce',
  ): { token: string; hash: string } => {
    const payload = `${prefix}:${userId}`;
    const token = Buffer.from(payload).toString('base64url');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    return { token, hash };
  };

  const createMockPendingUser = (
    activationToken: string,
    expiresAt: Date | null = new Date(Date.now() + 60_000),
    status: PendingUserStatus = PendingUserStatus.PENDING,
  ): jest.Mocked<PendingUserModel> => {
    return {
      getActivationToken: jest.fn().mockReturnValue(activationToken),
      getExpiresAt: jest.fn().mockReturnValue(expiresAt),
      getStatus: jest.fn().mockReturnValue(status),
    } as unknown as jest.Mocked<PendingUserModel>;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    repository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<PendingUserRepositoryPort>;

    useCase = new ValidateTokenUseCase(repository);
  });

  describe('execute', () => {
    it('should return valid=true when token matches pending user', async () => {
      const userId = 42;
      const { token, hash } = buildToken(userId);
      const mockPendingUser = createMockPendingUser(hash) as PendingUserModel;

      repository.findById.mockResolvedValue(mockPendingUser);

      const result = await useCase.execute(token);

      expect(result).toEqual({ valid: true });
      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(repository.findById).toHaveBeenCalledTimes(1);
      expect(mockPendingUser.getActivationToken).toHaveBeenCalled();
    });

    it('should throw NotFoundException when pending user does not exist', async () => {
      const userId = 7;
      const { token } = buildToken(userId);

      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute(token)).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw UnauthorizedException when activation hash mismatches', async () => {
      const userId = 55;
      const { token } = buildToken(userId);
      const wrongHash = 'mismatched-hash-value';
      const mockPendingUser = createMockPendingUser(wrongHash);

      repository.findById.mockResolvedValue(mockPendingUser);

      await expect(useCase.execute(token)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(mockPendingUser.getActivationToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token payload is malformed', async () => {
      const invalidToken =
        Buffer.from('missing-delimiter').toString('base64url');

      await expect(useCase.execute(invalidToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(repository.findById).not.toHaveBeenCalled();
    });

    it('should throw GoneException when token has expired', async () => {
      const userId = 91;
      const { token, hash } = buildToken(userId);
      const expiredDate = new Date(Date.now() - 1_000);
      const mockPendingUser = createMockPendingUser(hash, expiredDate);

      repository.findById.mockResolvedValue(mockPendingUser);

      await expect(useCase.execute(token)).rejects.toThrow(GoneException);
      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(mockPendingUser.getExpiresAt).toHaveBeenCalled();
    });

    it('should throw NotFound when token prefix is incorrect', async () => {
      const userId = 100;
      const { token } = buildToken(userId, 'wrong-prefix');

      await expect(useCase.execute(token)).rejects.toThrow(NotFoundException);
    });

    it('should handle null expiresAt as valid (never expires)', async () => {
      const userId = 200;
      const { token, hash } = buildToken(userId);
      const mockPendingUser = createMockPendingUser(hash, null);

      repository.findById.mockResolvedValue(mockPendingUser);

      const result = await useCase.execute(token);

      expect(result).toEqual({ valid: true });
    });
  });

  describe('extractUserIdFromToken', () => {
    it('should extract userId from valid token', () => {
      const userId = 42;
      const { token } = buildToken(userId);

      const extractedUserId = useCase.extractUserIdFromToken(token);

      expect(extractedUserId).toBe('42');
    });

    it('should throw when token is malformed', () => {
      const invalidToken = Buffer.from('no-colon').toString('base64url');

      expect(() => useCase.extractUserIdFromToken(invalidToken)).toThrow();
    });
  });
});
