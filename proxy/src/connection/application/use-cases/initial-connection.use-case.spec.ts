import { InitialConnectionUseCase } from './initial-connection.use-case';
import { CreateUserUseCase } from '../../../iam/application/use-cases/create-user.use-case';
import { ValidateTokenUseCase } from './validate-token.use-case';
import { PendingUserService } from '../../../pending-user/pending-user.service';
import { ThingsboardService } from '../../../thingsboard/thingsboard.service';
import { UserModel } from '../../../iam/domain/entities/user.model';
import { EntityId } from '../../../thingsboard/thingsboard.types';
import { ConnectionRepository } from '../../domain/repositories/connection.repository';
import { UserRepository } from '../../../iam/domain/repositories/user.repository';
import { UnitOfWork } from '../../infrastructure/transaction/unit-of-work';
import { InitialConnectionCommand } from '../dto/initial-connection.command';
import { ConnectionModel } from '../../domain/entities/connection.model';
import { RegisterMedplumUseCase } from '../../../medplum/application/use-cases/register-medplum.use-case';
import { MedplumRepository } from '../../../medplum/domain/repositories/medplum.repository';

describe('InitialConnectionUseCase', () => {
  let useCase: InitialConnectionUseCase;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let validateTokenUseCase: jest.Mocked<ValidateTokenUseCase>;
  let registerMedplumUseCase: jest.Mocked<RegisterMedplumUseCase>;
  let pendingUserService: jest.Mocked<PendingUserService>;
  let thingsboardService: jest.Mocked<ThingsboardService>;

  const mockedUserModel: UserModel = {
    id: 1,
    email: 'email@email.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'password',
    hashedRt: null,
  };

  const mockedConnection: ConnectionModel = {
    id: 1,
    userId: mockedUserModel.id!,
  };

  const mockedTBResult = {
    success: true,
    tenantId: 'tenantId',
    rollbackData: { tenantId: { id: 'tenantId' } as EntityId },
  };

  const mockedConnectionCommand = {
    tenantFields: {
      title: 'Project Title',
    },
    userFields: {
      userEmail: mockedUserModel.email,
      firstName: mockedUserModel.firstName,
      lastName: mockedUserModel.lastName,
      password: mockedUserModel.password,
    },
  } as InitialConnectionCommand;

  beforeEach(() => {
    jest.clearAllMocks();

    createUserUseCase = {
      executeWithRepo: jest.fn().mockResolvedValue(mockedUserModel),
    } as unknown as jest.Mocked<CreateUserUseCase>;
    validateTokenUseCase = {
      execute: jest.fn().mockResolvedValue({ valid: true }),
      extractUserIdFromToken: jest.fn().mockReturnValue('1'),
    } as unknown as jest.Mocked<ValidateTokenUseCase>;
    registerMedplumUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<RegisterMedplumUseCase>;

    pendingUserService = {
      deletePendingUserById: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<PendingUserService>;
    thingsboardService = {
      connectRegisterToThingsboard: jest.fn().mockResolvedValue(mockedTBResult),
      performRollback: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ThingsboardService>;

    useCase = new InitialConnectionUseCase(
      validateTokenUseCase,
      createUserUseCase,
      registerMedplumUseCase,
      pendingUserService,
      thingsboardService,
    );
  });

  const uow = {
    manager: { getRepository: jest.fn().mockReturnValue({}) },
    userRepository: {} as UserRepository,
    medplumRepository: {} as MedplumRepository,
    connectionRepository: {
      create: jest.fn().mockReturnValue(mockedConnection),
      save: jest.fn().mockResolvedValue(mockedConnection),
    } as unknown as ConnectionRepository,
  } as unknown as UnitOfWork;
  const token: string = '1';

  it('should validate token and extract id from it', async () => {
    await expect(
      useCase.execute(mockedConnectionCommand, token, uow),
    ).resolves.toBeDefined();

    expect(validateTokenUseCase.execute).toHaveBeenCalledTimes(1);
    expect(validateTokenUseCase.execute).toHaveBeenCalledWith(token);

    expect(validateTokenUseCase.extractUserIdFromToken).toHaveBeenCalledTimes(
      1,
    );
    expect(validateTokenUseCase.extractUserIdFromToken).toHaveBeenCalledWith(
      token,
    );
  });

  it('should remove pending user', async () => {
    await expect(
      useCase.execute(mockedConnectionCommand, token, uow),
    ).resolves.toBeDefined();

    expect(pendingUserService.deletePendingUserById).toHaveBeenCalledTimes(1);
    expect(pendingUserService.deletePendingUserById).toHaveBeenCalledWith(
      Number(token),
      {},
    );
  });

  it('should create user', async () => {
    const expectedModel = {
      email: mockedUserModel.email,
      firstName: mockedUserModel.firstName || 'Unknown Name',
      lastName: mockedUserModel.lastName || 'Unknown Lastname',
      password: mockedUserModel.password,
      hashedRt: null,
    };

    await expect(
      useCase.execute(mockedConnectionCommand, token, uow),
    ).resolves.toBeDefined();

    expect(createUserUseCase.executeWithRepo).toHaveBeenCalledTimes(1);
    expect(createUserUseCase.executeWithRepo).toHaveBeenCalledWith(
      expectedModel,
      {},
    );
  });

  it('should create connection', async () => {
    await expect(
      useCase.execute(mockedConnectionCommand, token, uow),
    ).resolves.toBeDefined();

    expect(uow.connectionRepository.create).toHaveBeenCalledTimes(1);
    expect(uow.connectionRepository.create).toHaveBeenCalledWith(
      mockedUserModel.id,
    );
    expect(uow.connectionRepository.save).toHaveBeenCalledTimes(1);
    expect(uow.connectionRepository.save).toHaveBeenCalledWith(
      mockedConnection,
    );
  });
});
