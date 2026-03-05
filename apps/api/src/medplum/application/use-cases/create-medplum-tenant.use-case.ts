import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UnitOfWork } from '../../../connection/infrastructure/transaction/unit-of-work';
import { MedplumRegistrationService } from '../services/medplum-registration.service';
import { CreateMedplumRequestDto } from '../../interface/rest/dto/create-medplum.request.dto';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../../thingsboard/application/ports/thingsboard.api.port';
import { ConfigService } from '@nestjs/config';
import { PasswordGeneratorService } from '../services/password-generator.service';

@Injectable()
export class CreateMedplumTenantUseCase {
  private readonly logger = new Logger(CreateMedplumTenantUseCase.name);

  constructor(
    private readonly registrationService: MedplumRegistrationService,
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
    private readonly configService: ConfigService,
    private readonly passwordGenerator: PasswordGeneratorService,
  ) {}

  private get TB_SYSADMIN_EMAIL(): string {
    return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_EMAIL');
  }
  private get TB_SYSADMIN_PASSWORD(): string {
    return this.configService.getOrThrow<string>(
      'THINGSBOARD_SYSADMIN_PASSWORD',
    );
  }

  /** Fetches the first TENANT_ADMIN user from ThingsBoard for the given tenantId. */
  private async getTenantAdminUser(tenantId: string): Promise<{
    firstName: string;
    lastName: string;
    email: string;
  }> {
    const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
      this.TB_SYSADMIN_EMAIL,
      this.TB_SYSADMIN_PASSWORD,
    );

    // Fetch all users for the tenant (up to 50) and find the first TENANT_ADMIN
    const usersResponse = await this.thingsboardApi.fetchTenantUsers(
      loginResponse.token,
      tenantId,
      0,
      50,
    );

    const adminUser = (usersResponse.data as any[]).find(
      (u: any) => u.authority === 'TENANT_ADMIN',
    );

    if (!adminUser) {
      throw new NotFoundException(
        `No TENANT_ADMIN user found for tenantId: ${tenantId}`,
      );
    }

    return {
      firstName: adminUser.firstName ?? '',
      lastName: adminUser.lastName ?? '',
      email: adminUser.email,
    };
  }

  async execute(dto: CreateMedplumRequestDto, uow: UnitOfWork): Promise<void> {
    this.logger.debug(
      `[execute] Looking up connection for tenantId=${dto.tenantId}`,
    );

    // 1. Find the Connection linked to this tenant via Thingsboard
    const connection = await uow.connectionRepository.getConnectionByTenantId(
      dto.tenantId,
    );

    this.logger.debug(
      `[execute] connection result: ${JSON.stringify(connection)}`,
    );

    if (!connection) {
      this.logger.error(
        `[execute] No connection found for tenantId=${dto.tenantId}`,
      );
      throw new NotFoundException(
        `Connection not found for tenantId: ${dto.tenantId}`,
      );
    }

    // 2. Guard: Medplum already enabled for this connection
    if (connection.medplumId) {
      throw new BadRequestException(
        'Medplum integration is already enabled for this tenant',
      );
    }

    // 3. Fetch project name from Thingsboard entity
    this.logger.debug(
      `[execute] Looking up thingsboard record for tenantId=${dto.tenantId}`,
    );
    const thingsboard = await uow.thingsboardRepository.findByTenantId(
      dto.tenantId,
    );

    this.logger.debug(
      `[execute] thingsboard result: ${JSON.stringify(thingsboard)}`,
    );

    if (!thingsboard) {
      throw new NotFoundException(
        `Thingsboard record not found for tenantId: ${dto.tenantId}`,
      );
    }

    const projectName = thingsboard.getProject();

    // 4. Fetch the TENANT_ADMIN user from ThingsBoard to get name/email
    const adminUser = await this.getTenantAdminUser(dto.tenantId);
    this.logger.debug(
      `Creating Medplum project "${projectName}" for tenantId: ${dto.tenantId}, admin: ${adminUser.email}`,
    );

    // 5. Generate a secure random password and call Medplum registration service
    const generatedPassword = this.passwordGenerator.generate();
    const { clientId, clientSecret } =
      await this.registrationService.registerAndGetClientApp({
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        password: generatedPassword,
        project: projectName,
      });

    // 6. Persist Medplum entity
    const medplumModel = uow.medplumRepository.create({
      client_id: clientId,
      client_secret: clientSecret,
      connection: { id: connection.id } as any,
    });

    if (!medplumModel) {
      throw new InternalServerErrorException('Failed to create Medplum model');
    }

    const savedMedplum = await uow.medplumRepository.save(medplumModel);
    if (!savedMedplum) {
      throw new InternalServerErrorException('Failed to save Medplum record');
    }

    this.logger.debug(`Saved Medplum record with id: ${savedMedplum.id}`);

    // 7. Update Connection to point to the new Medplum record
    connection.medplumId = savedMedplum.id;
    await uow.connectionRepository.save(connection);

    this.logger.debug(
      `Connection updated: medplumId=${savedMedplum.id} for tenantId=${dto.tenantId}`,
    );
  }
}
