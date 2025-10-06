import { Test, TestingModule } from '@nestjs/testing';
import { Medplum } from './medplum';

describe('Medplum', () => {
  let provider: Medplum;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Medplum],
    }).compile();

    provider = module.get<Medplum>(Medplum);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
