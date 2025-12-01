import { Injectable, Logger } from '@nestjs/common';
import { InitialConnectionResult } from '../dto/initial-connection.result';
import { PendingUserService } from '../../../pending-user/pending-user.service';
import { MedplumService } from '../../../medplum/medplum.service';
import { ThingsboardService } from '../../../thingsboard/thingsboard.service';
import { ValidateTokenUseCase } from './validate-token.use-case';
import { InitialConnectionCommand } from '../dto/initial-connection.command';
import { CreateUserUseCase } from '../../../iam/application/use-cases/create-user.use-case';
import { UserModel } from '../../../iam/domain/entities/user.model';
import { UnitOfWork } from '../../infrastructure/transaction/unit-of-work';
import { PendingUser } from '../../../entities/pending-user.entity';
import { Medplum } from '../../../entities/medplum.entity';
import { Thingsboard } from '../../../entities/thingsboard.entity';
import { Connection } from '../../infrastructure/persistance/connection.entity';
import { CreateProjectDto } from '../../../medplum/dtos/createProjectDto';
import { ThingsboardRollbackData } from '../../../thingsboard/thingsboard.types';

@Injectable()
export class InitialConnectionUseCase {
  private readonly logger = new Logger(InitialConnectionUseCase.name);

  constructor(
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly createUserUseCase: CreateUserUseCase,

    private readonly pendingUserService: PendingUserService,
    private readonly thingsboardService: ThingsboardService,
    private readonly medplumService: MedplumService,
  ) {}

  async execute(
    command: InitialConnectionCommand,
    token: string,
    uow: UnitOfWork,
  ): Promise<InitialConnectionResult> {
    await this.validateTokenUseCase.execute(token);

    const { userEmail, firstName, lastName, password } = command.userFields;
    const pendingUserId =
      this.validateTokenUseCase.extractUserIdFromToken(token);

    // not DDD!
    // TODO
    const pendingUserRepository = uow.manager.getRepository(PendingUser);
    const thingsboardRepository = uow.manager.getRepository(Thingsboard);
    const medplumRepository = uow.manager.getRepository(Medplum);

    // DDD ready
    const userRepository = uow.userRepository;
    const connectionRepository = uow.connectionRepository;

    // pending-user - to be replaced
    await this.pendingUserService.deletePendingUserById(
      Number(pendingUserId),
      pendingUserRepository,
    );

    // user
    const userModel: UserModel = {
      email: userEmail,
      firstName: firstName || 'Unknown Name',
      lastName: lastName || 'Unknown Lastname',
      password: password,
      hashedRt: null,
    };

    const newUser = await this.createUserUseCase.executeWithRepo(
      userModel,
      userRepository,
    );

    this.logger.debug(`Created new user: ` + JSON.stringify(newUser));

    // connection
    const newConnection = connectionRepository.create(newUser.id!);
    await connectionRepository.save(newConnection!);
    this.logger.debug('Created connection:' + JSON.stringify(newConnection));

    let thingsboardRollbackData: ThingsboardRollbackData | null = null;
    let result: InitialConnectionResult;

    try {
      // thingsboard - to be replaced
      const thingsboardResult =
        await this.thingsboardService.connectRegisterToThingsboard(
          command,
          newUser.id!,
          thingsboardRepository,
          uow.manager.getRepository(Connection),
        );

      this.logger.debug(
        `${thingsboardResult.message} with tenant ID: ${thingsboardResult.tenantId}`,
      );

      thingsboardRollbackData = thingsboardResult.rollbackData ?? null;

      //medplum - to be replaced
      const projectName = command.tenantFields.title;
      const createProject: CreateProjectDto = {
        firstName: firstName || 'Unknown Name',
        lastName: lastName || 'Unknown Lastname',
        password,
        email: userEmail,
        project: projectName,
      };

      await this.medplumService.create(
        createProject,
        newUser.id!,
        medplumRepository,
        uow.manager.getRepository(Connection),
      );

      this.logger.debug('Created Medplum project: ' + projectName);

      const { rollbackData, ...resultWithoutRollback } = thingsboardResult;
      result = resultWithoutRollback;
    } catch (error) {
      if (thingsboardRollbackData) {
        this.logger.warn(
          'Rolling back Thingsboard changes due to Medplum error / other failure',
        );

        await this.thingsboardService.performRollback(
          thingsboardRollbackData.tenantId,
          thingsboardRollbackData.userId,
          thingsboardRollbackData.sysAdminAccessToken,
        );
      }

      throw error;
    }
    return result;
  }
}
