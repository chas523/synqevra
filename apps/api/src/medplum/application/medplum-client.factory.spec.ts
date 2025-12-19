import { MedplumRepository } from '../domain/repositories/medplum.repository';
import { MedplumClientFactory } from './medplum-client.factory';
import { MedplumModel } from '../domain/entities/medplum.model';
import { BadRequestException } from '@nestjs/common';
import { MedplumClient } from '@medplum/core';

jest.mock('@medplum/core', () => ({
  MedplumClient: jest.fn().mockImplementation(() => ({
    startClientLogin: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('MedplumClientFactory', () => {
  let repository: jest.Mocked<MedplumRepository>;
  let factory: MedplumClientFactory;

  const mockedMedplum: MedplumModel = {
    id: 1,
    client_id: 'id',
    client_secret: 'secret',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    repository = {
      findByUserId: jest.fn(),
      findByTenantId: jest.fn(),
    } as unknown as jest.Mocked<MedplumRepository>;

    factory = new MedplumClientFactory(repository);
  });

  it('should throw when no userId nor tenantId provided', async () => {
    await expect(factory.initMedplum()).rejects.toThrow(
      'Either userId or tenantId must be provided',
    );

    await expect(factory.initMedplum()).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should return cached client for the same userId', async () => {
    repository.findByUserId.mockResolvedValue(mockedMedplum);

    const client1 = await factory.initMedplum(1);
    const client2 = await factory.initMedplum(1);
    const client3 = await factory.initMedplum(1);

    expect(client1).toStrictEqual(client2);
    expect(client1).toStrictEqual(client3);
    expect(repository.findByUserId).toHaveBeenCalledTimes(1);
    expect(MedplumClient).toHaveBeenCalledTimes(1);
  });

  it('should return cached client for the same project', async () => {
    repository.findByTenantId.mockResolvedValue(mockedMedplum);

    const tenantId: string = '123-123';
    const client1 = await factory.initMedplum(undefined, tenantId);
    const client2 = await factory.initMedplum(undefined, tenantId);
    const client3 = await factory.initMedplum(undefined, tenantId);

    expect(client1).toStrictEqual(client2);
    expect(client1).toStrictEqual(client3);
    expect(repository.findByTenantId).toHaveBeenCalledTimes(1);
    expect(MedplumClient).toHaveBeenCalledTimes(1);
  });

  it('should delete from project cache', async () => {
    repository.findByTenantId.mockResolvedValue(mockedMedplum);

    const tenantId: string = '123-123';
    const client1 = await factory.initMedplum(undefined, tenantId);

    expect(repository.findByTenantId).toHaveBeenCalledTimes(1);

    factory.deleteFromCache({ tenantId });

    const client2 = await factory.initMedplum(undefined, tenantId);

    expect(client1).not.toStrictEqual(client2);
    expect(repository.findByTenantId).toHaveBeenCalledTimes(2);
    expect(MedplumClient).toHaveBeenCalledTimes(2);
  });

  it('should delete from user cache', async () => {
    repository.findByUserId.mockResolvedValue(mockedMedplum);

    const userId = 1;
    const client1 = await factory.initMedplum(userId);

    expect(repository.findByUserId).toHaveBeenCalledTimes(userId);

    factory.deleteFromCache({ userId });

    const client2 = await factory.initMedplum(userId);

    expect(client1).not.toStrictEqual(client2);
    expect(repository.findByUserId).toHaveBeenCalledTimes(2);
    expect(MedplumClient).toHaveBeenCalledTimes(2);
  });
});
