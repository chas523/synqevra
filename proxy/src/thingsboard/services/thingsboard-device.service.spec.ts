import { ThingsboardDeviceService } from './thingsboard-device.service';
import { MedplumService } from '../../medplum/medplum.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { Device, DevicesResponse, EntityId } from '../thingsboard.types';
import { AxiosResponse } from 'axios';

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

describe('ThingsboardDeviceService', () => {
  let service: ThingsboardDeviceService;
  let configService: ConfigService;
  let medplumService: MedplumService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThingsboardDeviceService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn().mockReturnValue(
              of({
                data: {},
              }),
            ),
            post: jest.fn().mockReturnValue(of({ data: {} })),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('configValue'),
          },
        },
        {
          provide: MedplumService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ThingsboardDeviceService>(ThingsboardDeviceService);
    configService = module.get<ConfigService>(ConfigService);
    medplumService = module.get<MedplumService>(MedplumService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(configService).toBeDefined();
    expect(medplumService).toBeDefined();
    expect(httpService).toBeDefined();
  });

  describe('fetchDevices', () => {
    const accessToken = 'accessToken';
    const mockDevice = {
      id: { id: 'deviceId' } as EntityId,
      name: 'Device 1',
    } as Device;

    const mockDevicesResponse: DevicesResponse = {
      data: [mockDevice],
      totalElements: 0,
      totalPages: 0,
      hasNext: false,
    };

    const mockResponse: AxiosResponse<DevicesResponse> = {
      data: mockDevicesResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };

    beforeEach(() => {
      jest
        .spyOn(service as any, 'handleThingsboardError')
        .mockReturnValue(undefined);

      (httpService.get as jest.Mock).mockReturnValue(of(mockResponse));
    });

    it('should fetch devices successfully', async () => {
      const result = await service.fetchDevices(accessToken, 0, 10);
      expect(result).toEqual(mockDevicesResponse);
    });
  });
});
