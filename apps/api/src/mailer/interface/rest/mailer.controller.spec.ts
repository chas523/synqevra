import { Test, TestingModule } from '@nestjs/testing';
import { MailerController } from './mailer.controller';
import { CommandBus } from '@nestjs/cqrs';

describe('MailerController', () => {
  let controller: MailerController;
  const commandBusMock = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<CommandBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailerController],
      providers: [{ provide: CommandBus, useValue: commandBusMock }],
    }).compile();

    controller = module.get<MailerController>(MailerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
