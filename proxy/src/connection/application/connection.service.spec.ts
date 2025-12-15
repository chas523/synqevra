import { ConnectionService } from './connection.service';
import { Connection } from '../infrastructure/persistance/connection.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { UsersService } from '../../iam/application/users/users.service';
import { PendingUserService } from '../../pending-user/pending-user.service';
import { MedplumService } from '../../medplum/application/medplum.service';
import { ThingsboardService } from '../../thingsboard/thingsboard.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../iam/infrastructure/persistance/user.entity';
import {
  GoneException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import {
  PendingUser,
  PendingUserStatus,
} from '../../entities/pending-user.entity';
import { InitialConnectionFormDto } from '../interface/rest/dto/initial-connection-form.dto';
import { CreateUserDto } from '../../iam/interface/rest/dto/createUserDto';

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest
    .fn()
    .mockImplementation((size: number) => Buffer.from('a'.repeat(size))),
}));

describe('ConnectionService', () => {
  let service: ConnectionService;
  let repository: Repository<Connection>;
  let userService: UsersService;
  let pendingUserService: PendingUserService;
  let medplumService: MedplumService;
  let thingsboardService: ThingsboardService;
  let dataSource: DataSource;

  const CON_REPOSITORY_TOKEN = getRepositoryToken(Connection);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionService,
        {
          provide: CON_REPOSITORY_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getUserById: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: PendingUserService,
          useValue: {
            getPendingUserById: jest.fn(),
            deletePendingUserById: jest.fn(),
          },
        },
        {
          provide: MedplumService,
          useValue: {},
        },
        {
          provide: ThingsboardService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(),
            connect: jest.fn(),
            startTransaction: jest.fn(),
            manager: {
              getRepository: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ConnectionService>(ConnectionService);
    repository = module.get<Repository<Connection>>(CON_REPOSITORY_TOKEN);
    userService = module.get<UsersService>(UsersService);
    pendingUserService = module.get<PendingUserService>(PendingUserService);
    medplumService = module.get<MedplumService>(MedplumService);
    thingsboardService = module.get<ThingsboardService>(ThingsboardService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(userService).toBeDefined();
    expect(pendingUserService).toBeDefined();
    expect(medplumService).toBeDefined();
    expect(thingsboardService).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  const userId = 123;
  const mockUser = {
    id: userId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'email@email.com',
    password: 'hashedPassword',
  } as User;
  const mockSavedConnection = {
    id: 1,
    user: mockUser,
  } as Connection;
  const mockCreateConnection = {
    user: mockUser,
  } as Connection;
  mockUser.connection = mockSavedConnection;

  describe('createConnection', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(userService, 'getUserById').mockResolvedValue(mockUser);
      jest.spyOn(repository, 'create').mockReturnValue(mockCreateConnection);
      jest.spyOn(repository, 'save').mockResolvedValue(mockSavedConnection);
    });

    it('should return Promise', () => {
      const result = service.createConnection(userId);
      expect(result).toBeInstanceOf(Promise<Connection>);
    });

    it('should create connection', async () => {
      const result = await service.createConnection(userId);
      expect(result).toEqual(mockSavedConnection);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userService, 'getUserById').mockResolvedValue(null);

      await expect(service.createConnection(2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getConnectionByUserId', () => {
    beforeEach(() => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockSavedConnection);
    });

    it('should return Promise', () => {
      const result = service.getConnectionByUserId(userId);
      expect(result).toBeInstanceOf(Promise<Connection | null>);
    });

    it('should return Connection', async () => {
      const result = await service.getConnectionByUserId(userId);
      expect(result).toEqual(mockSavedConnection);
    });
  });

  describe('getOrCreateUserConnection', () => {
    const savedConnection = {
      ...mockSavedConnection,
      id: 2,
    } as Connection;

    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(userService, 'getUserById').mockResolvedValue(mockUser);
      jest.spyOn(repository, 'create').mockReturnValue(mockCreateConnection);
      jest.spyOn(repository, 'save').mockResolvedValue(mockSavedConnection);
      jest.spyOn(service, 'createConnection');
    });

    it('should return Promise', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(savedConnection);

      const result = service.getOrCreateUserConnection(userId, undefined);
      expect(result).toBeInstanceOf(Promise<Connection | null>);
    });

    it('should create new connection if user does not have one', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.getOrCreateUserConnection(userId, undefined);

      expect(service.createConnection).toHaveBeenCalledWith(userId, undefined);
      expect(result).toEqual(mockSavedConnection);
    });

    it('should return existing connection', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockSavedConnection);

      const result = await service.getOrCreateUserConnection(userId, undefined);

      expect(service.createConnection).not.toHaveBeenCalled();
      expect(result).toEqual(mockSavedConnection);
    });
  });

  describe('createToken', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return an object with tokenPayloadEncoded and hash', () => {
      const result = service.createToken(userId.toString());

      expect(result).toHaveProperty('tokenPayloadEncoded');
      expect(result).toHaveProperty('hash');
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
    });

    it('should generate hash based on tokenPayloadEncoded', () => {
      const expectedRawToken = Buffer.alloc(32, 'a').toString('base64url');
      const expectedTokenPayload = `${expectedRawToken}:${userId}`;
      const expectedTokenPayloadEncoded =
        Buffer.from(expectedTokenPayload).toString('base64url');
      const expectedHash = crypto
        .createHash('sha256')
        .update(expectedTokenPayloadEncoded)
        .digest('hex');

      const result = service.createToken(userId.toString());

      expect(result.tokenPayloadEncoded).toBe(expectedTokenPayloadEncoded);
      expect(result.hash).toBe(expectedHash);
    });
  });

  const rawToken = 'abc';
  const tokenPayload = `${rawToken}:${userId}`;
  const token = Buffer.from(tokenPayload).toString('base64url');
  const expectedHash = crypto.createHash('sha256').update(token).digest('hex');

  describe('validateToken', () => {
    const mockPendingUser = {
      id: 2,
      email: 'email@email.com',
      firstName: 'John',
      lastName: 'Doe',
    } as PendingUser;

    beforeEach(() => {
      jest.clearAllMocks();
      jest
        .spyOn(service as any, 'extractUserIdFromToken')
        .mockReturnValueOnce(userId.toString());
    });

    it('should extract userId from token', async () => {
      jest
        .spyOn(pendingUserService, 'getPendingUserById')
        .mockResolvedValue(mockPendingUser);

      const promise = service.validateToken(token);

      expect((service as any).extractUserIdFromToken).toHaveBeenCalledWith(
        token,
      );
      expect(pendingUserService.getPendingUserById).toHaveBeenCalledWith(
        userId,
      );
      // exact value or exception is not important here
      await expect(promise).rejects.toThrow();
    });

    it('should return valid:true if token is correct', async () => {
      const mockPendingUserWithToken = {
        ...mockPendingUser,
        activationToken: expectedHash,
        expiresAt: new Date(Date.now() + 10000),
        status: PendingUserStatus.PENDING,
      } as PendingUser;

      jest
        .spyOn(pendingUserService, 'getPendingUserById')
        .mockResolvedValue(mockPendingUserWithToken);

      const result = await service.validateToken(token);

      expect(result).toEqual({ valid: true });
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const mockInvalidPendingUser = {
        ...mockPendingUser,
        activationToken: 'wrongHash',
      };

      jest
        .spyOn(pendingUserService, 'getPendingUserById')
        .mockResolvedValue(mockInvalidPendingUser);

      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw GoneException if token is expired', async () => {
      const mockInvalidPendingUser = {
        ...mockPendingUser,
        activationToken: expectedHash,
        expiresAt: new Date(Date.now() - 10000),
      };

      jest
        .spyOn(pendingUserService, 'getPendingUserById')
        .mockResolvedValue(mockInvalidPendingUser);

      await expect(service.validateToken(token)).rejects.toThrow(GoneException);
    });

    it('should throw GoneException if invalid status', async () => {
      const mockInvalidPendingUser = {
        ...mockPendingUser,
        activationToken: expectedHash,
        expiresAt: new Date(Date.now() + 10000),
        status: PendingUserStatus.NEW,
      };

      jest
        .spyOn(pendingUserService, 'getPendingUserById')
        .mockResolvedValue(mockInvalidPendingUser);

      await expect(service.validateToken(token)).rejects.toThrow(GoneException);
    });
  });

  // describe('buildInitialConnection', () => {
  //   const mockQueryRunner = {
  //     connect: jest.fn().mockResolvedValue(undefined),
  //     startTransaction: jest.fn().mockResolvedValue(undefined),
  //     commitTransaction: jest.fn().mockResolvedValue(undefined),
  //     rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  //     release: jest.fn().mockResolvedValue(undefined),
  //     manager: {
  //       getRepository: jest.fn().mockReturnValue(undefined),
  //     },
  //   } as unknown as QueryRunner;
  //
  //   beforeEach(() => {
  //     jest.spyOn(service, 'validateToken').mockResolvedValue({ valid: true });
  //     jest
  //       .spyOn(service as any, 'extractUserIdFromToken')
  //       .mockReturnValueOnce(userId.toString());
  //     jest
  //       .spyOn(dataSource, 'createQueryRunner')
  //       .mockReturnValue(mockQueryRunner);
  //     jest.spyOn(userService, 'createUser').mockResolvedValueOnce(mockUser);
  //     jest.spyOn(repository, 'create').mockReturnValue(mockCreateConnection);
  //   });
  //
  //   it('should build initial connection', async () => {
  //     const formData = {
  //       userFields: {
  //         userEmail: 'email@email.com',
  //         firstName: 'John',
  //         lastName: 'Doe',
  //         password: 'hashedPassword',
  //       },
  //     } as InitialConnectionFormDto;
  //
  //     const expectedNewUser: CreateUserDto = {
  //       email: formData.userFields.userEmail,
  //       firstName: formData.userFields.firstName || 'Unknown Name',
  //       lastName: formData.userFields.lastName || 'Unknown Lastname',
  //       password: formData.userFields.password,
  //     };
  //
  //     // await service.buildInitialConnection(formData, token);
  //     //
  //     // expect(mockQueryRunner.connect).toHaveBeenCalled();
  //     // expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
  //     // expect(userService.createUser).toHaveBeenCalledWith(
  //     //   expectedNewUser
  //     // );
  //   });
  // });
});
