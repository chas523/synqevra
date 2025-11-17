import { Test, TestingModule } from '@nestjs/testing';
import { Hl7MapperService } from './hl7-mapper.service';

describe('Hl7MapperService', () => {
  let service: Hl7MapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Hl7MapperService],
    }).compile();

    service = module.get<Hl7MapperService>(Hl7MapperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
