import {
  ClientStorage,
  LoginAuthenticationResponse,
  LoginState,
  MedplumClient,
  MemoryStorage,
} from '@medplum/core';
import { webcrypto } from 'node:crypto';
import { MedplumRegistrationService } from './medplum-registration.service';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CreateProjectDto } from '../../interface/rest/dto/createProjectDto';

jest.mock('@medplum/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actual = jest.requireActual('@medplum/core');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...actual,
    MedplumClient: jest.fn(),
    ClientStorage: jest.fn(),
    MemoryStorage: jest.fn(),
  };
});

describe('MedplumRegistrationService', () => {
  let service: MedplumRegistrationService;

  const mockStartNewUser = jest.fn();
  const mockProcessCode = jest.fn();
  const mockStartNewProject = jest.fn();
  const mockGetActiveLogin = jest.fn();
  const mockSearchResources = jest.fn();

  const dto: CreateProjectDto = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'mail@mail.com',
    password: 'password',
    project: 'Project',
  };

  const medplumMock = () => {
    (MedplumClient as jest.Mock).mockImplementation(() => ({
      startNewUser: mockStartNewUser,
      processCode: mockProcessCode,
      startNewProject: mockStartNewProject,
      getActiveLogin: mockGetActiveLogin,
      searchResources: mockSearchResources,
      getBaseUrl: () => 'http://host.docker.internal:8103',
    }));
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    // silence logger
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    medplumMock();

    const moduleRef = await Test.createTestingModule({
      providers: [MedplumRegistrationService],
    }).compile();

    service = moduleRef.get<MedplumRegistrationService>(
      MedplumRegistrationService,
    );

    (globalThis as any).crypto = webcrypto;
    (globalThis as any).window = {
      btoa: (str: string) => Buffer.from(str, 'binary').toString('base64'),
      atob: (str: string) => Buffer.from(str, 'base64').toString('binary'),
      TextDecoder,
      TextEncoder,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    (globalThis as any).sessionStorage = new (MemoryStorage as jest.Mock)();

    (ClientStorage as jest.Mock).mockImplementation(() => ({
      getString: jest.fn(),
      setString: jest.fn(),
      removeString: jest.fn(),
    }));
  });

  it('should register user, create project and return credentials', async () => {
    const registrationResponse = {
      login: 'mockLogin',
      code: '200',
    };
    const projectResponse: LoginAuthenticationResponse = {
      login: 'mockLogin',
      code: '200',
    };
    const mockSearchResult = { id: 'client-id', secret: 'client-secret' };

    const loginState = {
      project: { reference: 'Project/123' },
    } as LoginState;

    mockStartNewUser.mockResolvedValue(registrationResponse);
    mockProcessCode.mockResolvedValue(undefined);
    mockStartNewProject.mockResolvedValue(projectResponse);
    mockSearchResources.mockResolvedValue([mockSearchResult]);
    mockGetActiveLogin.mockReturnValue(loginState);

    const result = await service.registerAndGetClientApp(dto);

    expect(result).toEqual({
      clientId: mockSearchResult.id,
      clientSecret: mockSearchResult.secret,
    });

    expect(mockStartNewUser).toHaveBeenCalledWith({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: dto.password,
      recaptchaToken: '',
    });
    expect(mockStartNewProject).toHaveBeenCalledWith({
      login: registrationResponse.login,
      projectName: dto.project,
    });
    expect(mockProcessCode).toHaveBeenCalledTimes(2);
    expect(mockGetActiveLogin).toHaveBeenCalledTimes(2);
    expect(mockSearchResources).toHaveBeenCalledWith('ClientApplication', {
      _project: '123',
    });
  });

  it('should throw BadRequestException if email is already registered', async () => {
    mockStartNewUser.mockRejectedValue(new Error('Email already registered'));

    await expect(service.registerAndGetClientApp(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.registerAndGetClientApp(dto)).rejects.toThrow(
      'Email already registered',
    );
  });

  it('should throw BadRequestException if password is not safe', async () => {
    mockStartNewUser.mockRejectedValue(
      new Error('Password found in breach database (password)'),
    );

    await expect(service.registerAndGetClientApp(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.registerAndGetClientApp(dto)).rejects.toThrow(
      'Password found in breach database',
    );
  });

  it('should throw BadRequestException when invalid password length', async () => {
    mockStartNewUser.mockRejectedValue(
      new Error('Password must be between 8 and 72 characters'),
    );

    await expect(service.registerAndGetClientApp(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.registerAndGetClientApp(dto)).rejects.toThrow(
      'Password must be between 8 and 72 characters',
    );
  });

  it('should throw InternalServerErrorException on other errors', async () => {
    mockStartNewUser.mockRejectedValue(new Error('Unknown error'));

    await expect(service.registerAndGetClientApp(dto)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    await expect(service.registerAndGetClientApp(dto)).rejects.toThrow(
      'Failed to register user or create project',
    );
  });
});
