import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  GoneException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Connection } from '../entities/connection.entity';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';
import { Thingsboard } from '../entities/thingsboard.entity';
import { Medplum } from '../entities/medplum.entity';
import { PendingUser } from '../entities/pending-user.entity';
import { InjectRepository } from '@nestjs/typeorm';

import * as crypto from 'crypto';
import { PendingUserService } from 'src/pending-user/pending-user.service';
import { PendingUserStatus } from 'src/entities/pending-user.entity';
import { InitialConnectionFormDto } from './dto/initial-connection-form.dto';
import { MedplumService } from 'src/medplum/medplum.service';
import { ThingsboardService } from 'src/thingsboard/thingsboard.service';
import { CreateUserDto } from 'src/users/dtos/createUserDto';
import { CreateProjectDto } from 'src/medplum/dtos/createProjectDto';
import { ThingsboardRollbackData } from 'src/thingsboard/thingsboard.types';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(Connection)
    private readonly connectionRepository: Repository<Connection>,
    private readonly usersService: UsersService,
    private readonly pendingUserService: PendingUserService,
    @Inject(forwardRef(() => ThingsboardService))
    private readonly thingsboardService: ThingsboardService,
    @Inject(forwardRef(() => MedplumService))
    private readonly medplumService: MedplumService,
    private readonly dataSource: DataSource, // <--- INJECTED HERE
  ) {}

  async createConnection(
    userId: number,
    customConnectionRepo?: Repository<Connection>,
  ) {
    const user: User | null = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const connectionRepo = customConnectionRepo || this.connectionRepository;
    const connection = connectionRepo.create({
      user: user,
    });
    return await connectionRepo.save(connection);
  }

  async getConnectionByUserId(userId: number) {
    return await this.connectionRepository.findOne({
      where: { user: { id: userId } },
    });
  }

  async getOrCreateUserConnection(
    userId: number,
    customConnectionRepo?: Repository<Connection>,
  ): Promise<Connection> {
    const connectionRepo = customConnectionRepo || this.connectionRepository;
    let connection = await connectionRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!connection) {
      connection = await this.createConnection(userId, customConnectionRepo);
    }
    return connection;
  }

  public createToken(userId: string): {
    tokenPayloadEncoded: string;
    hash: string;
  } {
    const rawToken = crypto.randomBytes(32).toString('base64url');
    const tokenPayload = `${rawToken}:${userId}`;
    const tokenPayloadEncoded = Buffer.from(tokenPayload).toString('base64url');
    const hash = crypto
      .createHash('sha256')
      .update(tokenPayloadEncoded)
      .digest('hex');
    return { tokenPayloadEncoded, hash };
  }

  private extractUserIdFromToken(token: string): string {
    let tokenPayload: string;
    try {
      tokenPayload = Buffer.from(token, 'base64url').toString();
    } catch {
      throw new UnauthorizedException('Invalid token format');
    }
    const parts = tokenPayload.split(':');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return parts[1];
  }

  async validateToken(token: string) {
    console.log(
      'validateToken called with token:',
      token?.substring(0, 20) + '...',
    );
    const userId = this.extractUserIdFromToken(token);
    console.log('Extracted userId:', userId);
    const pendingUser = await this.pendingUserService.getPendingUserById(
      Number(userId),
    );
    if (!pendingUser) {
      throw new NotFoundException('Pending user not found');
    }

    const hash = crypto.createHash('sha256').update(token).digest('hex');
    if (pendingUser.activationToken !== hash) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (pendingUser.expiresAt && pendingUser.expiresAt < new Date()) {
      throw new GoneException('Token expired');
    }

    if (pendingUser.status !== PendingUserStatus.PENDING) {
      throw new GoneException('Token already used or invalid status');
    }
    return { valid: true };
  }

  async buildInitialConnection(
    formData: InitialConnectionFormDto,
    token: string,
  ) {
    //everything happens inside transaction so in case of error we can simply roll everything back
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let newUser: User | null = null;
    let medplumCreated = false;
    let thingsboardCreated = false;
    let thingsboardRollbackData: ThingsboardRollbackData | null = null;
    try {
      await this.validateToken(token);

      const { userEmail, firstName, lastName, password } = formData.userFields;
      const pendingUserId = this.extractUserIdFromToken(token);
      //delete old PendingUser and create new User in our database
      const pendingUserRepository =
        queryRunner.manager.getRepository(PendingUser);
      //uncomment if you're done with testing
      // await this.pendingUserService.deletePendingUserById(
      //   Number(pendingUserId),
      //   pendingUserRepository,
      // );

      //create user
      const newUserDto: CreateUserDto = {
        email: userEmail,
        firstName: firstName || 'Unknown Name',
        lastName: lastName || 'Unknown Lastname',
        password,
      };
      newUser = await this.usersService.createUser(
        newUserDto,
        queryRunner.manager.getRepository(User),
      );
      console.log('Created new user:', newUser);

      //create connection entity
      const connectionRepository =
        queryRunner.manager.getRepository(Connection);
      const connection = connectionRepository.create({ user: newUser });
      await connectionRepository.save(connection);
      console.log('Created connection:', connection);

      //thingsboard connection
      const thingsboardRepository =
        queryRunner.manager.getRepository(Thingsboard);
      const thingsboardResult =
        await this.thingsboardService.connectRegisterToThingsboard(
          formData,
          newUser.id,
          thingsboardRepository,
          connectionRepository,
        );
      thingsboardCreated = true;
      thingsboardRollbackData = thingsboardResult.rollbackData;
      console.log(
        'Created Thingsboard project and connection:',
        thingsboardResult,
      );

      //medplum connection
      const projectName = formData.tenantFields.title;
      const createMedplumProjectDto: CreateProjectDto = {
        firstName: firstName || 'Unknown Name',
        lastName: lastName || 'Unknown Lastname',
        password,
        email: userEmail,
        project: projectName,
      };
      const medplumRepository = queryRunner.manager.getRepository(Medplum);
      await this.medplumService.create(
        createMedplumProjectDto,
        newUser.id,
        medplumRepository,
        connectionRepository,
      );
      medplumCreated = true;

      await queryRunner.commitTransaction();
      //we return thingsboard accessToken&refreshToken
      const { rollbackData, ...resultWithoutRollback } = thingsboardResult;
      return resultWithoutRollback;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      if (medplumCreated) {
        //no need to do anything. if medplum is created, then we're sure everything went good,
        //we'll never get here if medplumCreated
      }
      if (thingsboardCreated) {
        //thingsboard got created, but medplum threw an error. then we'll just rollback thingsboard progress
        console.log('Rolling back Thingsboard changes due to Medplum error');
        if (thingsboardRollbackData) {
          await this.thingsboardService.performRollback(
            thingsboardRollbackData.tenantId,
            thingsboardRollbackData.userId,
            thingsboardRollbackData.sysAdminAccessToken,
          );
        }
      }
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
