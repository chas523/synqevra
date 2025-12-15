import { RegisterMedplumUseCase } from './register-medplum.use-case';
import { MedplumRegistrationService } from '../services/medplum-registration.service';
import { UserRepository } from '../../../iam/domain/repositories/user.repository';
import { MedplumRepository } from '../../domain/repositories/medplum.repository';
import { ConnectionRepository } from '../../../connection/domain/repositories/connection.repository';
import { UnitOfWork } from '../../../connection/infrastructure/transaction/unit-of-work';
import { ConnectionModel } from '../../../connection/domain/entities/connection.model';
import { MedplumModel } from '../../domain/entities/medplum.model';
import { CreateProjectDto } from '../../interface/rest/dto/createProjectDto';

describe('RegisterMedplumUseCase', () => {
  let useCase: RegisterMedplumUseCase;
  let registrationService: jest.Mocked<MedplumRegistrationService>;

  const userId = 1;
  const mockedResponse = { clientId: 'id', clientSecret: 'secret' };
  const mockedConnection: ConnectionModel = {
    id: 1,
    userId: userId,
  };
  const mockedMedplum: MedplumModel = {
    id: 1,
    client_id: 'clientId',
    client_secret: 'clientSecret',
    connectionId: mockedConnection.id,
  };
  const uowMock = {
    manager: { getRepository: jest.fn().mockReturnValue({}) },
    userRepository: {} as UserRepository,
    medplumRepository: {
      create: jest.fn().mockReturnValue(mockedMedplum),
      save: jest.fn().mockReturnValue(mockedMedplum),
    } as unknown as MedplumRepository,
    connectionRepository: {
      getOrCreateByUserId: jest.fn().mockReturnValue(mockedConnection),
    } as unknown as ConnectionRepository,
  } as unknown as UnitOfWork;

  beforeEach(() => {
    jest.clearAllMocks();

    registrationService = {
      registerAndGetClientApp: jest.fn().mockReturnValue(mockedResponse),
    } as unknown as jest.Mocked<MedplumRegistrationService>;

    useCase = new RegisterMedplumUseCase(registrationService);
  });

  it('should register medplum and return medplum object', async () => {
    const dto = {
      project: 'Test Project',
      firstName: 'John',
      lastName: 'Doe',
      email: 'mail@mail.com',
    } as CreateProjectDto;

    const result = await useCase.execute(dto, userId, uowMock);

    expect(registrationService.registerAndGetClientApp).toHaveBeenCalledTimes(
      1,
    );
    expect(registrationService.registerAndGetClientApp).toHaveBeenCalledWith(
      dto,
    );
    expect(registrationService.registerAndGetClientApp).toHaveReturnedWith({
      clientId: mockedResponse.clientId,
      clientSecret: mockedResponse.clientSecret,
    });

    expect(result).toBe(mockedMedplum);
  });

  it('should use repositories from uow', async () => {
    const dto = {} as CreateProjectDto;

    await useCase.execute(dto, userId, uowMock);

    expect(
      uowMock.connectionRepository.getOrCreateByUserId,
    ).toHaveBeenCalledTimes(1);
    expect(
      uowMock.connectionRepository.getOrCreateByUserId,
    ).toHaveBeenCalledWith(userId);
    expect(uowMock.medplumRepository.create).toHaveBeenCalledTimes(1);
    expect(uowMock.medplumRepository.create).toHaveBeenCalledWith({
      client_id: mockedResponse.clientId,
      client_secret: mockedResponse.clientSecret,
      connection: mockedConnection,
    });
    expect(uowMock.medplumRepository.save).toHaveBeenCalledTimes(1);
    expect(uowMock.medplumRepository.save).toHaveBeenCalledWith(mockedMedplum);
  });

  it('should check if medplum connection already exists', async () => {
    jest
      .spyOn(uowMock.connectionRepository, 'getOrCreateByUserId')
      .mockResolvedValue({
        ...mockedConnection,
        medplumId: 1,
      });

    const dto = {} as CreateProjectDto;

    await expect(useCase.execute(dto, userId, uowMock)).rejects.toThrow(
      'Medplum connection already exists for this user',
    );
  });
});
