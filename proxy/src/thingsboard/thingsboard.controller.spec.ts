import { Test, TestingModule } from '@nestjs/testing';
import { ThingsboardController } from './thingsboard.controller';

describe('ThingsboardController', () => {
  let controller: ThingsboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThingsboardController],
    }).compile();

    controller = module.get<ThingsboardController>(ThingsboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
