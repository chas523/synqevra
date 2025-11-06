import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const USER_REPOSITORY_TOKEN = getRepositoryToken(User);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('createUser', () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@email.com',
      password: 'password',
    };

    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('encodedPassword');

    it('should use genSalt and hash method with provided password', async () => {
      await service.createUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 'salt');
    });

    it('should create and save a new user with encoded password', async () => {
      jest.spyOn(repository, 'create').mockReturnValue({
        ...userData,
        password: 'encodedPassword',
      } as User);

      await service.createUser(userData);

      expect(repository.create).toHaveBeenCalledWith({
        ...userData,
        password: 'encodedPassword',
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...userData,
        password: 'encodedPassword',
      } as User);
    });
  });
});
