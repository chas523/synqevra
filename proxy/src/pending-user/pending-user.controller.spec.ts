import { Test, TestingModule } from '@nestjs/testing';
import { PendingUserController } from './pending-user.controller';

describe('PendingUserController', () => {
  let controller: PendingUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PendingUserController],
    }).compile();

    controller = module.get<PendingUserController>(PendingUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
