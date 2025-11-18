import { Test } from '@nestjs/testing';
import { PostTelemetryUseCase } from '../../application/use-cases/post-telemetry.use-case';
import { ProxyController } from './proxy.controller';
import { TelemetryRequestDto } from './dto/telemetry-request.dto';
import { PostTelemetryCommand } from '../../application/dto/post-telemetry.command';
import { TelemetryResponseDto } from './dto/telemetry-response.dto';

describe('ProxyController', () => {
  let controller: ProxyController;
  let useCase: jest.Mocked<PostTelemetryUseCase>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProxyController],
      providers: [
        {
          provide: PostTelemetryUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = moduleRef.get(ProxyController);
    useCase = moduleRef.get(PostTelemetryUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(useCase).toBeDefined();
  });

  describe('postTelemetry', () => {
    it('should map request dto to PostTelemetryCommand and return result', async () => {
      useCase.execute.mockResolvedValue({
        status: 'SUCCESS',
        deviceId: 'dev-123',
        patientRef: 'Patient/1',
        counts: { total: 1, saved: 1, failed: 0 },
      });

      const body = {
        deviceId: 'tb-1',
        tenantId: 'tenant-1',
        timestamp: '2024-10-01T12:00:00Z',
        data: { heart_rate: 72 },
      };

      const result = await controller.postTelemetry(
        body as TelemetryRequestDto,
      );

      expect(useCase.execute).toHaveBeenCalledWith({
        deviceId: 'tb-1',
        tenantId: 'tenant-1',
        timestamp: '2024-10-01T12:00:00Z',
        data: { heart_rate: 72 },
      } as PostTelemetryCommand);

      expect(result).toEqual({
        status: 'SUCCESS',
        deviceId: 'dev-123',
        patientRef: 'Patient/1',
        counts: { total: 1, saved: 1, failed: 0 },
      } as TelemetryResponseDto);
    });
  });
});
