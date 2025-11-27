import { PostTelemetryUseCase } from './post-telemetry.use-case';
import { MedplumConnectionService } from '../../../connection/application/medplum-connection.service';
import { PostTelemetryCommand } from '../dto/post-telemetry.command';

describe('PostTelemetryUseCase', () => {
  let useCase: PostTelemetryUseCase;
  let medplumConnectionService: jest.Mocked<MedplumConnectionService>;
  let medplumClient: any;

  const mockedEntry = {
    entry: [
      { resource: { id: 'dev-123', patient: { reference: 'Patient/1' } } },
    ],
  };

  beforeEach(() => {
    medplumClient = {
      search: jest.fn().mockResolvedValue(mockedEntry),
      createResource: jest.fn().mockResolvedValue({ id: 'obs-1' }),
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    medplumConnectionService = {
      initMedplumWithProjectId: jest.fn().mockResolvedValue(medplumClient),
    } as any;

    useCase = new PostTelemetryUseCase(medplumConnectionService);
  });

  it('should return SUCCESS when all observations are created', async () => {
    const result = await useCase.execute({
      deviceId: 'tb-1',
      tenantId: 'tenant-1',
      data: { heart_rate: 72 },
      timestamp: '2024-10-01T12:00:00Z',
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.counts.total).toBe(1);
    expect(result.counts.saved).toBe(1);
    expect(result.counts.failed).toBe(0);
  });

  it('should return PARTIAL when not all observations are created', async () => {
    const result = await useCase.execute({
      deviceId: 'tb-1',
      tenantId: 'tenant-1',
      data: { heart_rate: 72, not_supported: 36.5 },
      timestamp: '2024-10-01T12:00:00Z',
    });

    expect(result.status).toBe('PARTIAL');
    expect(result.counts.total).toBe(2);
    expect(result.counts.saved).toBe(1);
    expect(result.counts.failed).toBe(1);
  });

  it('should return FAIL when no observations are created', async () => {
    const result = await useCase.execute({
      deviceId: 'tb-1',
      tenantId: 'tenant-1',
      data: { not_supported: 72 },
      timestamp: '2024-10-01T12:00:00Z',
    });

    expect(result.status).toBe('FAIL');
    expect(result.counts.total).toBe(1);
    expect(result.counts.saved).toBe(0);
    expect(result.counts.failed).toBe(1);
  });

  it('throws NotFoundException when no telemetry data', async () => {
    await expect(
      useCase.execute({
        deviceId: 'tb-1',
        tenantId: 'tenant-1',
        data: {},
      } as PostTelemetryCommand),
    ).rejects.toThrow('No telemetry data provided');
  });
});
