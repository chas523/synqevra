import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InitialConnectionResult } from '../dto/initial-connection.result';
import { ValidateTokenUseCase } from './validate-token.use-case';
import { InitialConnectionCommand } from '../dto/initial-connection.command';
import { CreateUserUseCase } from '../../../iam/application/use-cases/create-user.use-case';
import { CreateUserCommand } from '../../../iam/application/dto/create-user.command';
import { Role } from '../../../iam/domain/enums/role.enum';
import { UnitOfWork } from '../../infrastructure/transaction/unit-of-work';
import { ThingsboardRollbackData } from '../../../thingsboard/thingsboard.types';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterTenantCommand } from '../../../thingsboard/application/commands/register-tenant/register-tenant.command';
import { RegisterTenantResponseDto } from '../../../thingsboard/interface/rest/dtos/response/register-tenant.response.dto';
import {
  InvalidActivationLinkError,
  PasswordMismatchError,
  RegisterTenantError,
  RuleChainConfigurationError,
  RuleChainCreationError,
  TenantCreationError,
  ThingsboardConnectionExistsError,
  UserActivationError,
  UserAlreadyExistsError,
  UserCreationError,
} from '../../../thingsboard/domain/errors/thingsboard.errors';
import { match, Result } from 'oxide.ts';
import { DeleteTenantCommand } from '../../../thingsboard/application/commands/delete-tenant/delete-tenant.command';
import { UserNotFoundError } from '../../../pending-user/domain/errors/pending-user.errors';

@Injectable()
export class InitialConnectionUseCase {
  private readonly logger = new Logger(InitialConnectionUseCase.name);

  constructor(
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly commandBus: CommandBus,
  ) { }

  async execute(
    command: InitialConnectionCommand,
    token: string,
    uow: UnitOfWork,
  ): Promise<InitialConnectionResult> {
    await this.validateTokenUseCase.execute(token);

    const { userEmail, firstName, lastName, password } = command.userFields;
    const pendingUserId =
      this.validateTokenUseCase.extractPayloadFromToken(token).subjectId;

    // pending-user
    const deletedPendingUser = await uow.pendingUserRepository.delete(
      Number(pendingUserId),
    );
    if (!deletedPendingUser) {
      throw new UserNotFoundError();
    }

    // user
    const userModel: CreateUserCommand = {
      email: userEmail,
      firstName: firstName || 'Unknown Name',
      lastName: lastName || 'Unknown Lastname',
      password: password,
    };
    const newUser = await this.createUserUseCase.executeWithUOW(userModel, uow);
    this.logger.debug(`Created new user: ` + JSON.stringify(newUser));

    // connection
    const newConnection = uow.connectionRepository.create(newUser.id!);
    if (newConnection) {
      newConnection.role = Role.MODERATOR;
    }
    await uow.connectionRepository.save(newConnection!);
    this.logger.debug('Created connection:' + JSON.stringify(newConnection));

    let thingsboardRollbackData: ThingsboardRollbackData | null = null;
    let result: InitialConnectionResult;

    try {
      // thingsboard
      const thingsboardCommand = new RegisterTenantCommand(
        newUser.id!,
        command,
        uow,
      );
      const thingsboardCommandResult: Result<
        RegisterTenantResponseDto,
        RegisterTenantError
      > = await this.commandBus.execute(thingsboardCommand);

      const thingsboardResult = this.handleThingsboardResult(
        thingsboardCommandResult,
      );

      this.logger.debug(
        `${thingsboardResult.message} with tenant ID: ${thingsboardResult.tenantId}`,
      );

      thingsboardRollbackData = thingsboardResult.rollbackData ?? null;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { rollbackData, ...resultWithoutRollback } = thingsboardResult;
      result = resultWithoutRollback;
    } catch (err) {
      if (thingsboardRollbackData) {
        this.logger.warn(
          'Rolling back Thingsboard changes due to Medplum error / other failure',
        );

        const rollbackResult = await this.commandBus.execute(
          new DeleteTenantCommand(thingsboardRollbackData),
        );
        if (rollbackResult.isErr()) throw rollbackResult.unwrapErr();
      }

      throw err;
    }

    return result;
  }

  private handleThingsboardResult(
    result: Result<RegisterTenantResponseDto, RegisterTenantError>,
  ) {
    return match(result, {
      Ok: (response) => response,
      Err: (error: RegisterTenantError) => {
        if (error instanceof PasswordMismatchError) {
          throw new BadRequestException(error.message);
        }
        if (error instanceof UserAlreadyExistsError) {
          throw new ConflictException(error.message);
        }
        if (error instanceof ThingsboardConnectionExistsError) {
          throw new ConflictException(error.message);
        }
        if (
          error instanceof TenantCreationError ||
          error instanceof UserCreationError ||
          error instanceof UserActivationError ||
          error instanceof InvalidActivationLinkError
        ) {
          throw new BadRequestException(error.message);
        }
        if (
          error instanceof RuleChainCreationError ||
          error instanceof RuleChainConfigurationError
        ) {
          throw new InternalServerErrorException(error.message);
        }

        throw new InternalServerErrorException('Failed to register tenant');
      },
    });
  }
}
