import { DeviceUseCase } from './device.use-case';
import { MedplumClientPort } from '../ports/medplum-client.port';
import { Device } from '@medplum/fhirtypes';
import { WithId } from '@medplum/core';

describe('DeviceUseCase', () => {
  let useCase: DeviceUseCase;
  let medplumClient: jest.Mocked<MedplumClientPort>;

  const mockDevice: Device = {
    resourceType: 'Device',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    medplumClient = {
      findDeviceWithUserId: jest.fn().mockReturnValue(mockDevice),
      createDevice: jest
        .fn()
        .mockReturnValue({ ...mockDevice, id: 'deviceId' } as WithId<Device>),
    } as unknown as jest.Mocked<MedplumClientPort>;

    useCase = new DeviceUseCase(medplumClient);
  });

  it('should get promise of device with selected id', async () => {
    const result = useCase.getDevice(1, 'deviceId');

    expect(medplumClient.findDeviceWithUserId).toHaveBeenCalledWith(
      1,
      'deviceId',
    );
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toBe(mockDevice);
  });

  it('should create device and return it', async () => {
    const dto = { identifier: 'deviceIdentifier', patientRef: 'Patient/1' };

    const result = useCase.createDevice(1, dto);

    expect(medplumClient.createDevice).toHaveBeenCalledWith(dto, 1);
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toEqual({ ...mockDevice, id: 'deviceId' });
  });
});
