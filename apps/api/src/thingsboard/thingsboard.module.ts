import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { Thingsboard } from './infrastructure/persistence/thingsboard.entity';
import { ThingsboardController } from './interface/rest/thingsboard.controller';
import { ConnectionModule } from 'src/connection/connection.module';
import { MedplumModule } from 'src/medplum/medplum.module';

// Infrastructure
import { ThingsboardApiAdapter } from './infrastructure/http/thingsboard.api.adapter';
import { ThingsboardRepositoryAdapter } from './infrastructure/persistence/thingsboard.repository.adapter';
import { THINGSBOARD_API_PORT } from './application/ports/thingsboard.api.port';
import { THINGSBOARD_REPOSITORY_PORT } from './application/ports/thingsboard.repository.port';

// Command Handlers
import { CreateDeviceCommandHandler } from './application/commands/create-device/create-device.command-handler';
import { DeleteDeviceCommandHandler } from './application/commands/delete-device/delete-device.command-handler';
import { UpdateDeviceSharedAttributesCommandHandler } from './application/commands/update-device-shared-attributes/update-device-shared-attributes.command-handler';
import { RegisterTenantCommandHandler } from './application/commands/register-tenant/register-tenant.command-handler';
import { ThingsboardLoginCommandHandler } from './application/commands/thingsboard-login/thingsboard-login.command-handler';
import { RefreshTokenCommandHandler } from './application/commands/refresh-token/refresh-token.command-handler';
import { ConfirmPractitionerCommandHandler } from './application/commands/confirm-practitioner/confirm-practitioner.command-handler';
import { DeleteTenantCommandHandler } from './application/commands/delete-tenant/delete-tenant.command-handler';

// Query Handlers
import { FetchDevicesQueryHandler } from './application/queries/fetch-devices/fetch-devices.query.handler';
import { FetchDeviceByIdQueryHandler } from './application/queries/fetch-device-by-id/fetch-device-by-id.query.handler';
import { FetchDeviceSharedAttributesQueryHandler } from './application/queries/fetch-device-shared-attributes/fetch-device-shared-attributes.query-handler';
import { GetUserQueryHandler } from './application/queries/get-user/get-user.query-handler';
import { ThingsboardRollbackService } from './application/services/thingsboard-rollback.service';

const commandHandlers = [
  CreateDeviceCommandHandler,
  DeleteDeviceCommandHandler,
  UpdateDeviceSharedAttributesCommandHandler,
  RegisterTenantCommandHandler,
  ThingsboardLoginCommandHandler,
  DeleteTenantCommandHandler,
  RefreshTokenCommandHandler,
  ConfirmPractitionerCommandHandler,
];

const queryHandlers = [
  FetchDevicesQueryHandler,
  FetchDeviceByIdQueryHandler,
  FetchDeviceSharedAttributesQueryHandler,
  GetUserQueryHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Thingsboard]),
    HttpModule,
    CqrsModule,
    forwardRef(() => ConnectionModule),
    forwardRef(() => MedplumModule),
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    {
      provide: THINGSBOARD_API_PORT,
      useClass: ThingsboardApiAdapter,
    },
    {
      provide: THINGSBOARD_REPOSITORY_PORT,
      useClass: ThingsboardRepositoryAdapter,
    },
    ThingsboardRollbackService,
  ],
  controllers: [ThingsboardController],
  exports: [
    THINGSBOARD_REPOSITORY_PORT,
    THINGSBOARD_API_PORT,
    ThingsboardRollbackService,
  ],
})
export class ThingsboardModule {}
