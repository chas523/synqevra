import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Thingsboard } from './infrastructure/persistence/thingsboard.entity';
import { ThingsboardController } from './interface/rest/thingsboard.controller';
import { DashboardController } from './interface/rest/dashboard.controller';
import { ConnectionModule } from 'src/connection/connection.module';
import { MedplumModule } from 'src/medplum/medplum.module';

// Infrastructure
import { ThingsboardApiAdapter } from './infrastructure/http/thingsboard.api.adapter';
import { ThingsboardRepositoryAdapter } from './infrastructure/persistence/thingsboard.repository.adapter';
import { ThingsboardTelemetryAdapter } from './infrastructure/websocket/thingsboard.telemetry.adapter';
import { TelemetryGateway } from './interface/websocket/telemetry.gateway';
import { THINGSBOARD_API_PORT } from './application/ports/thingsboard.api.port';
import { THINGSBOARD_REPOSITORY_PORT } from './application/ports/thingsboard.repository.port';
import { THINGSBOARD_TELEMETRY_PORT } from './application/ports/thingsboard.telemetry.port';

// Command Handlers
import { CreateDeviceCommandHandler } from './application/commands/create-device/create-device.command-handler';
import { DeleteDeviceCommandHandler } from './application/commands/delete-device/delete-device.command-handler';
import { UpdateDeviceSharedAttributesCommandHandler } from './application/commands/update-device-shared-attributes/update-device-shared-attributes.command-handler';
import { RegisterTenantCommandHandler } from './application/commands/register-tenant/register-tenant.command-handler';
import { ThingsboardLoginCommandHandler } from './application/commands/thingsboard-login/thingsboard-login.command-handler';
import { RefreshTokenCommandHandler } from './application/commands/refresh-token/refresh-token.command-handler';
import { ConfirmPractitionerCommandHandler } from './application/commands/confirm-practitioner/confirm-practitioner.command-handler';
import { DeleteTenantCommandHandler } from './application/commands/delete-tenant/delete-tenant.command-handler';
import { UpdateSecuritySettingsCommandHandler } from './application/commands/update-security-settings/update-security-settings.command.handler';
import { UpdateTenantCommandHandler } from './application/commands/update-tenant/update-tenant.command-handler';
import { SaveEntityAttributesCommandHandler } from './application/commands/save-entity-attributes/save-entity-attributes.command-handler';
import { CreateRelationCommandHandler } from './application/commands/create-relation/create-relation.command-handler';
import { DeleteRelationCommandHandler } from './application/commands/delete-relation/delete-relation.command-handler';

// Query Handlers
import { FetchDevicesQueryHandler } from './application/queries/fetch-devices/fetch-devices.query.handler';
import { FetchDeviceByIdQueryHandler } from './application/queries/fetch-device-by-id/fetch-device-by-id.query.handler';
import { FetchDeviceSharedAttributesQueryHandler } from './application/queries/fetch-device-shared-attributes/fetch-device-shared-attributes.query-handler';
import { GetUserQueryHandler } from './application/queries/get-user/get-user.query-handler';
import { FetchSecuritySettingsQueryHandler } from './application/queries/fetch-security-settings/fetch-security-settings.query.handler';
import { FetchTenantsQueryHandler } from './application/queries/fetch-tenants/fetch-tenants.query-handler';
import { FetchTenantUsersQueryHandler } from './application/queries/fetch-users-by-tenant/fetch-tenant-users.query-handler';
import { FetchTenantDevicesQueryHandler } from './application/queries/fetch-tenant-devices/fetch-tenant-devices.query-handler';
import { FetchNotificationsQueryHandler } from './application/queries/fetch-notifications/fetch-notifications.query-handler';
import { FetchTenantAttributesQueryHandler } from './application/queries/fetch-tenant-attributes/fetch-tenant-attributes.query-handler';
import { FetchTenantAlarmsQueryHandler } from './application/queries/fetch-tenant-alarms/fetch-tenant-alarms.query-handler';
import { FetchTenantEventsQueryHandler } from './application/queries/fetch-tenant-events/fetch-tenant-events.query-handler';
import { FetchTenantRelationsQueryHandler } from './application/queries/fetch-tenant-relations/fetch-tenant-relations.query-handler';

// Services
import { TelemetryService } from './application/services/telemetry.service';
import { ThingsboardRollbackService } from './application/services/thingsboard-rollback.service';
import { TelemetryParserService } from './application/services/telemetry-parser.service';
import { SysAdminAuthService } from './application/services/sysadmin-auth.service';

const commandHandlers = [
  CreateDeviceCommandHandler,
  DeleteDeviceCommandHandler,
  UpdateDeviceSharedAttributesCommandHandler,
  RegisterTenantCommandHandler,
  ThingsboardLoginCommandHandler,
  DeleteTenantCommandHandler,
  RefreshTokenCommandHandler,
  ConfirmPractitionerCommandHandler,
  UpdateSecuritySettingsCommandHandler,
  UpdateTenantCommandHandler,
  SaveEntityAttributesCommandHandler,
  CreateRelationCommandHandler,
  DeleteRelationCommandHandler,
];

const queryHandlers = [
  FetchDevicesQueryHandler,
  FetchDeviceByIdQueryHandler,
  FetchDeviceSharedAttributesQueryHandler,
  GetUserQueryHandler,
  FetchTenantsQueryHandler,
  FetchTenantUsersQueryHandler,
  FetchTenantDevicesQueryHandler,
  FetchNotificationsQueryHandler,
  FetchSecuritySettingsQueryHandler,
  FetchTenantAttributesQueryHandler,
  FetchTenantAlarmsQueryHandler,
  FetchTenantEventsQueryHandler,
  FetchTenantRelationsQueryHandler,
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
    {
      provide: THINGSBOARD_TELEMETRY_PORT,
      useClass: ThingsboardTelemetryAdapter,
    },
    ThingsboardRollbackService,
    TelemetryService,
    TelemetryParserService,
    TelemetryGateway,
    SysAdminAuthService,
  ],
  controllers: [ThingsboardController, DashboardController],
  exports: [
    THINGSBOARD_REPOSITORY_PORT,
    THINGSBOARD_API_PORT,
    THINGSBOARD_TELEMETRY_PORT,
    ThingsboardRollbackService,
    TelemetryService,
  ],
})
export class ThingsboardModule { }
