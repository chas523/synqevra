import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ThingsboardService } from './thingsboard.service';
import { Thingsboard } from '../entities/thingsboard.entity';
import { User } from '../iam/infrastructure/persistance/user.entity';
import { ConnectionService } from '../connection/connection.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Connection } from '../entities/connection.entity';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityId, ThingsboardLoginResponse } from './thingsboard.types';
import { AxiosResponse } from 'axios';
import { of, firstValueFrom } from 'rxjs';

jest.mock('rxjs', () => ({
  ...jest.requireActual('rxjs'),
  firstValueFrom: jest.fn(),
}));

//silence logger
jest.mock('@nestjs/common', () => {
  return {
    ...jest.requireActual('@nestjs/common'),
    Logger: class MockLogger {
      error = jest.fn();
      log = jest.fn();
      debug = jest.fn();

      static overrideLogger = jest.fn();
      static log = jest.fn();
      static error = jest.fn();
      static debug = jest.fn();
    },
  };
});

describe('ThingsboardService', () => {
  let service: ThingsboardService;
  let repository: Repository<Thingsboard>;
  let connectionService: ConnectionService;
  let httpService: HttpService;

  const TB_REPOSITORY_TOKEN = getRepositoryToken(Thingsboard);
  const mockedFirstValueFrom = firstValueFrom as jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThingsboardService,
        {
          provide: TB_REPOSITORY_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getOne: jest.fn(),
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn().mockReturnValue({
              data: {},
            }),
            post: jest.fn().mockReturnValue({
              data: {},
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('configValue'),
          },
        },
        {
          provide: ConnectionService,
          useValue: {
            getOrCreateUserConnection: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ThingsboardService>(ThingsboardService);
    repository = module.get<Repository<Thingsboard>>(
      getRepositoryToken(Thingsboard),
    );
    connectionService = module.get<ConnectionService>(ConnectionService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(connectionService).toBeDefined();
  });

  describe('createThingsboardConnection', () => {
    const userId = 1;
    const tenantId = '123-abc-456-def';
    const projectName = 'Test Project';

    const userData = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@email.com',
      password: 'password',
    } as User;

    const mockConnection = {
      id: 1,
      user: userData,
      thingsboard: null,
      medplum: null,
    };

    const mockThingsboard = {
      project: projectName,
      connection: mockConnection,
      tenantId: tenantId,
    };

    it('should throw BadRequestException if Thingsboard connection exists', async () => {
      const mockConnectionWithThingsboard = {
        ...mockConnection,
        thingsboard: { id: 1 } as Thingsboard,
      };

      jest
        .spyOn(connectionService, 'getOrCreateUserConnection')
        .mockResolvedValue(mockConnectionWithThingsboard);

      await expect(
        service.createThingsboardConnection(userId, tenantId, projectName),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a new Thingsboard connection', async () => {
      jest
        .spyOn(connectionService, 'getOrCreateUserConnection')
        .mockResolvedValue(mockConnection as Connection);
      jest
        .spyOn(repository, 'create')
        .mockReturnValue(mockThingsboard as Thingsboard);
      jest.spyOn(repository, 'save').mockResolvedValue({
        id: 1,
        ...mockThingsboard,
      } as Thingsboard);

      // Main function call
      const result = await service.createThingsboardConnection(
        userId,
        tenantId,
        projectName,
      );

      expect(connectionService.getOrCreateUserConnection).toHaveBeenCalledWith(
        userId,
        undefined, //connection repo
      );
      expect(repository.create).toHaveBeenCalledWith({
        project: projectName,
        tenantId: tenantId,
        connection: mockConnection,
      });
      expect(repository.save).toHaveBeenCalledWith(
        mockThingsboard as Thingsboard,
      );
      expect(result).toEqual({ id: 1, ...mockThingsboard } as Thingsboard);
    });
  });

  describe('connectRegisterToThingsboard', () => {
    const userId = 1;
    const tenantId = '123-abc-456-def';
    const mockUserData = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@email.com',
      password: 'password',
    } as User;

    const mockConnection = {
      id: 1,
      user: mockUserData,
      thingsboard: null,
      medplum: null,
    } as Connection;

    const mockThingsboard = {
      id: 1,
      tenantId: tenantId,
      project: 'Test Project',
      connection: mockConnection,
    };

    const tenantFormFields = {
      title: 'Tenant Title',
      userEmail: 'john@email.com',
      password: 'zaq1@WSX',
      confirmPassword: 'zaq1@WSX',
    };

    const userFormFields = {
      userEmail: 'john@email.com',
      password: 'zaq1@WSX',
      confirmPassword: 'zaq1@WSX',
    };

    const tenantFormData = {
      tenantFields: tenantFormFields,
      userFields: userFormFields,
    };

    it("should throw BadRequestException if user passwords don't match", async () => {
      const noMatchingUserPasswords = {
        ...tenantFormData,
        userFields: {
          ...userFormFields,
          confirmPassword: 'zaq1',
        },
      };

      await expect(
        service.connectRegisterToThingsboard(noMatchingUserPasswords, userId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.connectRegisterToThingsboard(noMatchingUserPasswords, userId),
      ).rejects.toThrow('Passwords do not match');
    });

    it('should throw BadRequestException if user password is too weak', async () => {
      const weakPassword = {
        ...tenantFormData,
        userFields: {
          ...userFormFields,
          password: 'zaq1',
          confirmPassword: 'zaq1',
        },
      };

      await expect(
        service.connectRegisterToThingsboard(weakPassword, userId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.connectRegisterToThingsboard(weakPassword, userId),
      ).rejects.toThrow('Password must be at least 6 characters long');
    });

    it('should throw BadRequestException if userEmail is empty', async () => {
      const invalidUserEmail = {
        ...tenantFormData,
        userFields: {
          ...userFormFields,
          userEmail: '',
        },
      };

      await expect(
        service.connectRegisterToThingsboard(invalidUserEmail, userId),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.connectRegisterToThingsboard(invalidUserEmail, userId),
      ).rejects.toThrow('User email is required');
    });

    describe('Registration data flow', () => {
      const tenantId = '123-abc-456-def';

      const tenantEntity = {
        entityType: 'TENANT',
        id: tenantId,
      } as EntityId;
      const newUserId = 'newTenantId';
      const sysAdminToken = 'sysAdminToken';
      const activationLink = 'activationLink';
      const createTenantAdminResponse = {
        tenantId: tenantId,
        token: 'token',
        refreshToken: 'refreshToken',
      };
      const createdRulechain = {
        entityType: 'RULECHAIN',
        id: 'deviceId',
      } as EntityId;

      beforeEach(() => {
        jest
          .spyOn(service, 'createThingsboardConnection')
          .mockResolvedValueOnce(mockThingsboard);

        jest
          .spyOn(service as any, 'loginToThingsboardWithSysadminAccount')
          .mockResolvedValue(sysAdminToken);
        jest.spyOn(service as any, 'addTenant').mockResolvedValue(tenantEntity);
        jest
          .spyOn(service as any, 'addTenantAdmin')
          .mockResolvedValue(newUserId);
        jest
          .spyOn(service as any, 'getNewUserActivationLink')
          .mockResolvedValue(activationLink);
        jest
          .spyOn(service as any, 'createTenantAdminPassword')
          .mockResolvedValue(createTenantAdminResponse);
        jest
          .spyOn(service as any, 'createBaseRuleChain')
          .mockResolvedValue(createdRulechain);
        jest
          .spyOn(service as any, 'setRuleChainAsDefaultForDeviceProfile')
          .mockResolvedValue(undefined);
        jest
          .spyOn(service as any, 'saveTokensToDatabase')
          .mockResolvedValue(undefined);
        jest
          .spyOn(service as any, 'rollbackChanges')
          .mockResolvedValue(undefined);
      });

      it('should try to create Thingsboard connection in database', async () => {
        const tenantId = '123-abc-456-def';

        await service.connectRegisterToThingsboard(tenantFormData, userId);

        expect(service.createThingsboardConnection).toHaveBeenCalledWith(
          userId,
          tenantId,
          tenantFormFields.title,
          undefined,
          undefined,
        );
      });

      it('should try to authenticate as sysadmin', async () => {
        await service.connectRegisterToThingsboard(tenantFormData, userId);

        expect(
          (service as any).loginToThingsboardWithSysadminAccount,
        ).toHaveBeenCalled();
      });

      it('should try to create tenant admin', async () => {
        const userEmail = {
          userEmail: userFormFields.userEmail,
        };

        await service.connectRegisterToThingsboard(tenantFormData, userId);

        expect((service as any).addTenantAdmin).toHaveBeenCalledWith(
          userEmail,
          tenantEntity,
          sysAdminToken,
        );
      });

      it('should try to generate activation link', async () => {
        await service.connectRegisterToThingsboard(tenantFormData, userId);

        expect((service as any).getNewUserActivationLink).toHaveBeenCalledWith(
          newUserId,
          sysAdminToken,
        );
      });

      it('should try to set tenant admin password', async () => {
        await service.connectRegisterToThingsboard(tenantFormData, userId);

        expect((service as any).createTenantAdminPassword).toHaveBeenCalledWith(
          activationLink,
          sysAdminToken,
          userFormFields.password,
        );
      });

      it('should try to create base rule chain', async () => {
        await service.connectRegisterToThingsboard(tenantFormData, userId);

        expect((service as any).createBaseRuleChain).toHaveBeenCalledWith(
          createTenantAdminResponse.token,
        );
      });

      it('should try to set new rulechain as default', async () => {
        await service.connectRegisterToThingsboard(tenantFormData, userId);

        expect(
          (service as any).setRuleChainAsDefaultForDeviceProfile,
        ).toHaveBeenCalledWith(
          createTenantAdminResponse.token,
          createdRulechain,
        );
      });

      it('should try to save tokens to database', async () => {
        await service.connectRegisterToThingsboard(tenantFormData, userId);

        expect((service as any).saveTokensToDatabase).toHaveBeenCalledWith(
          userId,
          createTenantAdminResponse.token,
          createTenantAdminResponse.refreshToken,
          undefined,
        );
      });

      it('should try to rollback changes if error', async () => {
        await service.connectRegisterToThingsboard(tenantFormData, userId);

        await expect(
          service.connectRegisterToThingsboard(tenantFormData, userId),
        ).rejects.toThrow(InternalServerErrorException);

        expect((service as any).rollbackChanges).toHaveBeenCalled();
      });

      it('should create tenant and tenant admin successfully', async () => {
        const result = await service.connectRegisterToThingsboard(
          tenantFormData,
          userId,
        );

        expect(result).toEqual({
          success: true,
          tenantId: tenantId,
          accessToken: 'token',
          refreshToken: 'refreshToken',
          message: 'Tenant and admin user created successfully',
          rollbackData: {
            tenantId: {
              entityType: 'TENANT',
              id: tenantId,
            } as EntityId,
            userId: null,
            sysAdminAccessToken: 'sysAdminToken',
          },
        });
      });
    });
  });

  describe('performRollback', () => {
    it('should perform rollback without errors', async () => {
      jest
        .spyOn(service as any, 'rollbackChanges')
        .mockResolvedValue(undefined);

      const tenantId = {
        entityType: 'TENANT',
        id: 'tenantId',
      } as EntityId;
      const userId = 'userId';
      const systemAdminToken = 'sysAdminToken';

      //edge cases
      await expect(
        service.performRollback(tenantId, null),
      ).resolves.not.toThrow();
      await expect(
        service.performRollback(null, userId),
      ).resolves.not.toThrow();
      await expect(service.performRollback(null, null)).resolves.not.toThrow();
      await expect(
        service.performRollback(null, null, systemAdminToken),
      ).resolves.not.toThrow();
      await expect(
        service.performRollback(tenantId, userId, systemAdminToken),
      ).resolves.not.toThrow();

      expect((service as any).rollbackChanges).toHaveBeenCalledTimes(5);
    });
  });

  describe('getUser', () => {
    const mockUserData = { id: 'userId', name: 'Test User' };

    it('should throw error if access token is not provided', async () => {
      await expect(service.getUser()).rejects.toThrow(BadRequestException);
    });

    it('should return user data if access token is provided', async () => {
      mockedFirstValueFrom.mockResolvedValue({
        data: mockUserData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const accessToken = 'validToken';

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.getUser(accessToken);

      expect(result).toEqual(mockUserData);
    });
  });

  describe('getTokens', () => {
    const userId = 1;
    const mockTokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    } as Thingsboard;

    it('should execute query and return tokens', async () => {
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockTokens),
      };

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(
          mockQueryBuilder as unknown as SelectQueryBuilder<Thingsboard>,
        );

      const result = await service.getTokens(userId);

      expect(result).toEqual(mockTokens);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.id = :userId', {
        userId: userId,
      });
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'thingsboard.accessToken',
        'thingsboard.refreshToken',
      ]);
      expect(mockQueryBuilder.getOne).toHaveBeenCalledTimes(1);
    });

    it('should handle no data', async () => {
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(
          mockQueryBuilder as unknown as SelectQueryBuilder<Thingsboard>,
        );

      const result = await service.getTokens(userId);

      expect(result).toBeNull();
    });
  });

  describe('refresh', () => {
    const userId = 1;
    const tenantId = '123-abc-456-def';
    const mockUser = { id: userId } as User;
    const mockConnection = {
      id: 1,
      user: mockUser,
      thingsboard: null,
      medplum: null,
    } as Connection;
    const mockThingsboard: Thingsboard = {
      id: 1,
      tenantId: tenantId,
      project: 'Test Project',
      accessToken: 'oldAccessToken',
      refreshToken: 'oldRefreshToken',
      connection: mockConnection,
    };
    const mockTokenResponse = {
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
    };
    const axiosMockResponse = {
      data: {
        token: mockTokenResponse.accessToken,
        refreshToken: mockTokenResponse.refreshToken,
      },
    } as AxiosResponse;

    beforeEach(() => {
      jest.clearAllMocks();
      mockedFirstValueFrom.mockReset();

      jest
        .spyOn(service as any, 'saveTokensToDatabase')
        .mockResolvedValue(undefined);

      jest.spyOn(httpService, 'post').mockReturnValue(of(axiosMockResponse));

      mockedFirstValueFrom.mockResolvedValue(axiosMockResponse);
    });

    it('should return refresh token', async () => {
      jest.spyOn(service, 'getTokens').mockResolvedValue(mockThingsboard);
      const result = await service.refresh(userId);

      expect(service.getTokens).toHaveBeenCalledWith(userId);
      expect(mockedFirstValueFrom).toHaveBeenCalledTimes(1);
      expect((service as any).saveTokensToDatabase).toHaveBeenCalledWith(
        userId,
        mockTokenResponse.accessToken,
        mockTokenResponse.refreshToken,
      );
      expect(result).toEqual(mockTokenResponse);
    });
  });

  describe('thingsboardLogin', () => {
    const userId = 1;
    const accessToken = 'accessToken';
    const refreshToken = 'refreshToken';

    const mockThingsboardLoginResponse = {
      token: accessToken,
      refreshToken: refreshToken,
    } as ThingsboardLoginResponse;

    const axiosMockResponse = {
      data: {
        token: accessToken,
        refreshToken: refreshToken,
      },
    } as AxiosResponse;

    beforeEach(() => {
      jest.clearAllMocks();
      mockedFirstValueFrom.mockClear();

      jest
        .spyOn(service as any, 'loginWithTokens')
        .mockResolvedValue(undefined);

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(
          of({ data: mockThingsboardLoginResponse } as AxiosResponse),
        );

      mockedFirstValueFrom.mockResolvedValue(axiosMockResponse);
    });

    it('should execute query and return tokens', async () => {
      const expected = {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };

      const result = await service.thingsboardLogin(
        userId,
        'username',
        'password',
      );

      expect((service as any).loginWithTokens).toHaveBeenCalledWith(
        userId,
        accessToken,
        refreshToken,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('loginWithTokens', () => {
    it('should try to save tokens to database', async () => {
      jest
        .spyOn(service as any, 'saveTokensToDatabase')
        .mockResolvedValue(undefined);

      await service.loginWithTokens(1, 'accessToken', 'refreshToken');

      expect((service as any).saveTokensToDatabase).toHaveBeenCalledWith(
        1,
        'accessToken',
        'refreshToken',
      );
    });
  });
});
