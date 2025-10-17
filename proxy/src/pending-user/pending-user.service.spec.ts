import { Test, TestingModule } from '@nestjs/testing';
import { PendingUserService } from './pending-user.service';

describe('PendingUserService', () => {
  let service: PendingUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PendingUserService],
    }).compile();

    service = module.get<PendingUserService>(PendingUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
