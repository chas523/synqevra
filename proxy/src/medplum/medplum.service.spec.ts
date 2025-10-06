import { Test, TestingModule } from '@nestjs/testing';
import { MedplumService } from './medplum.service';

describe('MedplumService', () => {
  let service: MedplumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedplumService],
    }).compile();

    service = module.get<MedplumService>(MedplumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
