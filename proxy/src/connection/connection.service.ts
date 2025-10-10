import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Connection } from '../entities/connection.entity';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(Connection)
    private readonly connectionRepository: Repository<Connection>,
    private readonly usersService: UsersService,
  ) {}

  async createConnection(userId: number) {
    const user: User | null = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const connection = this.connectionRepository.create({
      user: user,
    });
    return await this.connectionRepository.save(connection);
  }

  async getConnectionByUserId(userId: number) {
    return await this.connectionRepository.findOne({
      where: { user: { id: userId } },
    });
  }

  async getOrCreateUserConnection(userId: number): Promise<Connection> {
    let connection = await this.connectionRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!connection) {
      connection = await this.createConnection(userId);
    }
    return connection;
  }
}
