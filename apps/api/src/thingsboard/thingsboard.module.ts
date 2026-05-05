import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Thingsboard } from './infrastructure/persistence/thingsboard.entity';
import { ThingsboardController } from './interface/rest/thingsboard.controller';
import { DashboardController } from './interface/rest/dashboard.controller';
import { ConnectionModule } from 'src/connection/connection.module';
import { MedplumModule } from 'src/medplum/medplum.module';
import { IamModule } from 'src/iam/iam.module';

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
import { CreateAssetCommandHandler } from './application/commands/create-asset/create-asset.command-handler';
import { CreateEntityViewCommandHandler } from './application/commands/create-entity-view/create-entity-view.command-handler';
import { FetchEntityViewTypesCommandHandler } from './application/commands/fetch-entity-view-types/fetch-entity-view-types.command-handler';
import { DeleteDeviceCommandHandler } from './application/commands/delete-device/delete-device.command-handler';
import { UpdateDeviceSharedAttributesCommandHandler } from './application/commands/update-device-shared-attributes/update-device-shared-attributes.command-handler';
import { AddDeviceLatestTelemetryCommandHandler } from './application/commands/add-device-latest-telemetry/add-device-latest-telemetry.command-handler';
import { CreateDeviceCalculatedFieldCommandHandler } from './application/commands/create-device-calculated-field/create-device-calculated-field.command-handler';
import { RegisterTenantCommandHandler } from './application/commands/register-tenant/register-tenant.command-handler';
import { ThingsboardLoginCommandHandler } from './application/commands/thingsboard-login/thingsboard-login.command-handler';
import { RefreshTokenCommandHandler } from './application/commands/refresh-token/refresh-token.command-handler';
import { ConfirmPractitionerCommandHandler } from './application/commands/confirm-practitioner/confirm-practitioner.command-handler';
import { DeleteTenantCommandHandler } from './application/commands/delete-tenant/delete-tenant.command-handler';
import { UpdateSecuritySettingsCommandHandler } from './application/commands/update-security-settings/update-security-settings.command.handler';
import { UpdateGeneralSettingsCommandHandler } from './application/commands/update-general-settings/update-general-settings.command.handler';
import { UpdateConnectivitySettingsCommandHandler } from './application/commands/update-connectivity-settings/update-connectivity-settings.command.handler';
import { UpdateSmsSettingsCommandHandler } from './application/commands/update-sms-settings/update-sms-settings.command.handler';
import { UpdateNotificationSettingsCommandHandler } from './application/commands/update-notification-settings/update-notification-settings.command.handler';
import { CreateQueueCommandHandler } from './application/commands/create-queue/create-queue.command.handler';
import { DeleteQueueCommandHandler } from './application/commands/delete-queue/delete-queue.command.handler';
import { CreateResourceCommandHandler } from './application/commands/create-resource/create-resource.command.handler';
import { DeleteResourceCommandHandler } from './application/commands/delete-resource/delete-resource.command.handler';
import { UpdateTenantCommandHandler } from './application/commands/update-tenant/update-tenant.command-handler';
import { SaveEntityAttributesCommandHandler } from './application/commands/save-entity-attributes/save-entity-attributes.command-handler';
import { CreateRelationCommandHandler } from './application/commands/create-relation/create-relation.command-handler';
import { DeleteRelationCommandHandler } from './application/commands/delete-relation/delete-relation.command-handler';
import { SaveTenantProfileCommandHandler } from './application/commands/save-tenant-profile/save-tenant-profile.command-handler';
import { UploadImageCommandHandler } from './application/commands/upload-image/upload-image.command.handler';
import { DeleteImageCommandHandler } from './application/commands/delete-image/delete-image.command.handler';
import { UpdateMailSettingsCommandHandler } from './application/commands/update-mail-settings/update-mail-settings.command.handler';
import { DeleteWidgetTypeCommandHandler } from './application/commands/delete-widget-type/delete-widget-type.command.handler';
import { SendNotificationCommandHandler } from './application/commands/send-notification/send-notification.command-handler';
import { CreateNotificationTargetCommandHandler } from './application/commands/create-notification-target/create-notification-target.command-handler';
import { CreateNotificationTemplateCommandHandler } from './application/commands/create-notification-template/create-notification-template.command-handler';
import { CreateNotificationRuleCommandHandler } from './application/commands/create-notification-rule/create-notification-rule.command-handler';
import { PreviewNotificationRequestCommandHandler } from './application/commands/preview-notification-request/preview-notification-request.command-handler';
import { CreateOtaPackageCommandHandler } from './application/commands/create-ota-package/create-ota-package.command-handler';
import { DeleteOtaPackageCommandHandler } from './application/commands/delete-ota-package/delete-ota-package.command-handler';
import { CheckRepoAccessCommandHandler } from './application/commands/check-repo-access/check-repo-access.command-handler';
import { SaveRepoSettingsCommandHandler } from './application/commands/save-repo-settings/save-repo-settings.command-handler';
import { DeleteRepoSettingsCommandHandler } from './application/commands/delete-repo-settings/delete-repo-settings.command-handler';
import { SaveTrendzSettingsCommandHandler } from './application/commands/save-trendz-settings/save-trendz-settings.command-handler';
import { SaveAiModelCommandHandler } from './application/commands/save-ai-model/save-ai-model.command-handler';
import { DeleteAiModelCommandHandler } from './application/commands/delete-ai-model/delete-ai-model.command-handler';
import { CheckAiModelConnectivityCommandHandler } from './application/commands/check-ai-model-connectivity/check-ai-model-connectivity.command-handler';
import { SaveAutoCommitSettingsCommandHandler } from './application/commands/save-auto-commit-settings/save-auto-commit-settings.command-handler';
import { DeleteAutoCommitSettingsCommandHandler } from './application/commands/delete-auto-commit-settings/delete-auto-commit-settings.command-handler';
import { CreateVersionCommandHandler } from './application/commands/create-version/create-version.command-handler';
import { RestoreVersionHandler } from './application/commands/restore-version/restore-version.handler';
import { CreateRuleChainFullCommandHandler } from './application/commands/create-rule-chain-full/create-rule-chain-full.command-handler';
import { DeleteRuleChainCommandHandler } from './application/commands/delete-rule-chain/delete-rule-chain.command-handler';
import { SetRootRuleChainCommandHandler } from './application/commands/set-root-rule-chain/set-root-rule-chain.command-handler';
import { SaveRuleChainMetadataCommandHandler } from './application/commands/save-rule-chain-metadata/save-rule-chain-metadata.command-handler';
import { DeleteEntityAttributesCommandHandler } from './application/commands/delete-entity-attributes/delete-entity-attributes.command-handler';
import { FetchEntityAttributesQueryHandler } from './application/queries/fetch-entity-attributes/fetch-entity-attributes.query-handler';
import { FetchEntityAlarmsQueryHandler } from './application/queries/fetch-entity-alarms/fetch-entity-alarms.query-handler';
import { FetchEntityRelationsQueryHandler } from './application/queries/fetch-entity-relations/fetch-entity-relations.query-handler';
import { FetchEntityAuditLogsQueryHandler } from './application/queries/fetch-entity-audit-logs/fetch-entity-audit-logs.query-handler';
import { FetchEntityTelemetryQueryHandler } from './application/queries/fetch-entity-telemetry/fetch-entity-telemetry.query-handler';
import { FetchEntityTelemetryKeysQueryHandler } from './application/queries/fetch-entity-telemetry-keys/fetch-entity-telemetry-keys.query-handler';

// Query Handlers
import { FetchDevicesQueryHandler } from './application/queries/fetch-devices/fetch-devices.query.handler';
import { FetchAssetsQueryHandler } from './application/queries/fetch-assets/fetch-assets.query-handler';
import { FetchEntityViewsQueryHandler } from './application/queries/fetch-entity-views/fetch-entity-views.query-handler';
import { FetchDeviceByIdQueryHandler } from './application/queries/fetch-device-by-id/fetch-device-by-id.query.handler';
import { FetchDeviceSharedAttributesQueryHandler } from './application/queries/fetch-device-shared-attributes/fetch-device-shared-attributes.query-handler';
import { FetchDeviceLatestTelemetryQueryHandler } from './application/queries/fetch-device-latest-telemetry/fetch-device-latest-telemetry.query-handler';
import { FetchDeviceTelemetryKeysQueryHandler } from './application/queries/fetch-device-telemetry-keys/fetch-device-telemetry-keys.query-handler';
import { FetchDeviceCalculatedFieldsQueryHandler } from './application/queries/fetch-device-calculated-fields/fetch-device-calculated-fields.query-handler';
import { FetchDeviceAlarmsQueryHandler } from './application/queries/fetch-device-alarms/fetch-device-alarms.query-handler';
import { FetchDeviceEventsQueryHandler } from './application/queries/fetch-device-events/fetch-device-events.query-handler';
import { FetchDeviceAuditLogsQueryHandler } from './application/queries/fetch-device-audit-logs/fetch-device-audit-logs.query-handler';
import { FetchDeviceRelationsQueryHandler } from './application/queries/fetch-device-relations/fetch-device-relations.query-handler';
import { GetUserQueryHandler } from './application/queries/get-user/get-user.query-handler';
import { FetchSecuritySettingsQueryHandler } from './application/queries/fetch-security-settings/fetch-security-settings.query.handler';
import { FetchTenantsQueryHandler } from './application/queries/fetch-tenants/fetch-tenants.query-handler';
import { FetchTenantUsersQueryHandler } from './application/queries/fetch-users-by-tenant/fetch-tenant-users.query-handler';
import { FetchTenantDevicesQueryHandler } from './application/queries/fetch-tenant-devices/fetch-tenant-devices.query-handler';
import { FetchNotificationsQueryHandler } from './application/queries/fetch-notifications/fetch-notifications.query-handler';
import { FetchVersionQueryHandler } from './application/queries/fetch-version/fetch-version.query-handler';
import { FetchGeneralSettingsQueryHandler } from './application/queries/fetch-general-settings/fetch-general-settings.query.handler';
import { FetchConnectivitySettingsQueryHandler } from './application/queries/fetch-connectivity-settings/fetch-connectivity-settings.query.handler';
import { FetchSmsSettingsQueryHandler } from './application/queries/fetch-sms-settings/fetch-sms-settings.query.handler';
import { FetchNotificationSettingsQueryHandler } from './application/queries/fetch-notification-settings/fetch-notification-settings.query.handler';
import { FetchQueuesQueryHandler } from './application/queries/fetch-queues/fetch-queues.query.handler';
import { FetchResourcesQueryHandler } from './application/queries/fetch-resources/fetch-resources.query.handler';
import { DownloadResourceQueryHandler } from './application/queries/download-resource/download-resource.query.handler';
import { FetchTenantAttributesQueryHandler } from './application/queries/fetch-tenant-attributes/fetch-tenant-attributes.query-handler';
import { FetchTenantAlarmsQueryHandler } from './application/queries/fetch-tenant-alarms/fetch-tenant-alarms.query-handler';
import { FetchTenantEventsQueryHandler } from './application/queries/fetch-tenant-events/fetch-tenant-events.query-handler';
import { FetchTenantRelationsQueryHandler } from './application/queries/fetch-tenant-relations/fetch-tenant-relations.query-handler';
import { FetchTenantProfilesQueryHandler } from './application/queries/fetch-tenant-profiles/fetch-tenant-profiles.query-handler';
import { FetchTenantProfileAttributesQueryHandler } from './application/queries/fetch-tenant-profile-attributes/fetch-tenant-profile-attributes.query-handler';
import { FetchTenantProfileAlarmsQueryHandler } from './application/queries/fetch-tenant-profile-alarms/fetch-tenant-profile-alarms.query-handler';
import { FetchDeliveryMethodsQueryHandler } from './application/queries/fetch-delivery-methods/fetch-delivery-methods.query-handler';
import { FetchNotificationRequestsQueryHandler } from './application/queries/fetch-notification-requests/fetch-notification-requests.query-handler';
import { FetchNotificationTargetsQueryHandler } from './application/queries/fetch-notification-targets/fetch-notification-targets.query-handler';
import { FetchNotificationTemplatesQueryHandler } from './application/queries/fetch-notification-templates/fetch-notification-templates.query-handler';
import { FetchNotificationRulesQueryHandler } from './application/queries/fetch-notification-rules/fetch-notification-rules.query-handler';
import { FetchMaterialIconsQueryHandler } from './application/queries/fetch-material-icons/fetch-material-icons.query-handler';
import { FetchImagesQueryHandler } from './application/queries/fetch-images/fetch-images.query.handler';
import { DownloadImageQueryHandler } from './application/queries/download-image/download-image.query.handler';
import { ExportImageQueryHandler } from './application/queries/export-image/export-image.query.handler';
import { FetchMailSettingsQueryHandler } from './application/queries/fetch-mail-settings/fetch-mail-settings.query.handler';
import { FetchWidgetTypesQueryHandler } from './application/queries/fetch-widget-types/fetch-widget-types.query.handler';
import { FetchWidgetTypeByIdQueryHandler } from './application/queries/fetch-widget-type-by-id/fetch-widget-type-by-id.query.handler';
import { SaveWidgetTypeCommandHandler } from './application/commands/save-widget-type/save-widget-type.command.handler';
import { SaveWidgetBundleCommandHandler } from './application/commands/save-widget-bundle/save-widget-bundle.command.handler';
import { DownloadWidgetTypeQueryHandler } from './application/queries/download-widget-type/download-widget-type.query.handler';
import { FetchTwoFaSettingsQueryHandler } from './application/queries/fetch-2fa-settings/fetch-2fa-settings.query.handler';
import { SaveTwoFaSettingsCommandHandler } from './application/commands/save-2fa-settings/save-2fa-settings.command.handler';
import { FetchWidgetsBundlesHandler } from './application/queries/fetch-widgets-bundles/fetch-widgets-bundles.handler';
import { FetchWidgetTypeFqnsHandler } from './application/queries/fetch-widget-type-fqns/fetch-widget-type-fqns.handler';
import { SaveWidgetTypeFqnsHandler } from './application/commands/save-widget-type-fqns/save-widget-type-fqns.handler';
import { FetchWidgetBundlesQueryHandler } from './application/queries/fetch-widget-bundles/fetch-widget-bundles.query.handler';
import { FetchWidgetBundleByIdQueryHandler } from './application/queries/fetch-widget-bundle-by-id/fetch-widget-bundle-by-id.query-handler';
import { FetchAssetProfilesQueryHandler } from './application/queries/fetch-asset-profiles/fetch-asset-profiles.query.handler';
import { FetchOtaPackagesQueryHandler } from './application/queries/fetch-ota-packages/fetch-ota-packages.query.handler';
import { DownloadOtaPackageQueryHandler } from './application/queries/download-ota-package/download-ota-package.query.handler';
import { FetchDeviceProfileInfosQueryHandler } from './application/queries/fetch-device-profile-infos/fetch-device-profile-infos.query.handler';
import { FetchDeviceProfilesQueryHandler } from './application/queries/fetch-device-profiles/fetch-device-profiles.query.handler';
import { FetchRepoSettingsInfoQueryHandler } from './application/queries/fetch-repo-settings-info/fetch-repo-settings-info.query.handler';
import { FetchRepoSettingsQueryHandler } from './application/queries/fetch-repo-settings/fetch-repo-settings.query.handler';
import { FetchVersionsQueryHandler } from './application/queries/fetch-versions/fetch-versions.query.handler';
import { FetchBranchesQueryHandler } from './application/queries/fetch-branches/fetch-branches.query.handler';
import { FetchTrendzSettingsQueryHandler } from './application/queries/fetch-trendz-settings/fetch-trendz-settings.query.handler';
import { FetchAiModelsQueryHandler } from './application/queries/fetch-ai-models/fetch-ai-models.query.handler';
import { FetchAutoCommitSettingsQueryHandler } from './application/queries/fetch-auto-commit-settings/fetch-auto-commit-settings.query.handler';
import { FetchVersionCreationStatusQueryHandler } from './application/queries/fetch-version-creation-status/fetch-version-creation-status.query.handler';
import { FetchEntitiesByTypeQueryHandler } from './application/queries/fetch-entities-by-type/fetch-entities-by-type.query.handler';
import { FetchRestoreVersionStatusHandler } from './application/queries/fetch-restore-version-status/fetch-restore-version-status.handler';
import { FetchAuditLogsQueryHandler } from './application/queries/fetch-audit-logs/fetch-audit-logs.handler';
import { FetchDomainInfosQueryHandler } from './application/queries/fetch-domain-infos/fetch-domain-infos.handler';
import { FetchOAuth2ClientInfosQueryHandler } from './application/queries/fetch-oauth2-client-infos/fetch-oauth2-client-infos.handler';
import { CreateDomainCommandHandler } from './application/commands/create-domain/create-domain.handler';
import { FetchDomainByIdQueryHandler } from './application/queries/fetch-domain-by-id/fetch-domain-by-id.handler';
import { UpdateDomainCommandHandler } from './application/commands/update-domain/update-domain.handler';
import { FetchOAuth2ConfigTemplateQueryHandler } from './application/queries/fetch-oauth2-config-template/fetch-oauth2-config-template.handler';
import { SaveOAuth2ClientCommandHandler } from './application/commands/save-oauth2-client/save-oauth2-client.handler';
import { FetchOAuth2ClientByIdHandler } from './application/queries/fetch-oauth2-client-by-id/fetch-oauth2-client-by-id.handler';
import { FetchRuleChainsQueryHandler } from './application/queries/fetch-rule-chains/fetch-rule-chains.query-handler';
import { FetchRuleChainByIdHandler } from './application/queries/fetch-rule-chain-by-id/fetch-rule-chain-by-id.handler';
import { FetchRuleChainMetadataHandler } from './application/queries/fetch-rule-chain-metadata/fetch-rule-chain-metadata.handler';
import { FetchEntityEventsQueryHandler } from './application/queries/fetch-entity-events/fetch-entity-events.query-handler';
import { FetchVersionDiffQueryHandler } from './application/queries/fetch-version-diff/fetch-version-diff.query.handler';
import { GetUserTokenQueryHandler } from './application/queries/get-user-token/get-user-token.query.handler';

// Services
import { TelemetryService } from './application/services/telemetry.service';
import { ThingsboardRollbackService } from './application/services/thingsboard-rollback.service';
import { TelemetryParserService } from './application/services/telemetry-parser.service';
import { StorageService } from './application/services/storage.service';
import { SysAdminAuthService } from './application/services/sysadmin-auth.service';

const commandHandlers = [
  CreateDeviceCommandHandler,
  CreateAssetCommandHandler,
  CreateEntityViewCommandHandler,
  FetchEntityViewTypesCommandHandler,
  DeleteDeviceCommandHandler,
  UpdateDeviceSharedAttributesCommandHandler,
  AddDeviceLatestTelemetryCommandHandler,
  CreateDeviceCalculatedFieldCommandHandler,
  RegisterTenantCommandHandler,
  ThingsboardLoginCommandHandler,
  DeleteTenantCommandHandler,
  RefreshTokenCommandHandler,
  ConfirmPractitionerCommandHandler,
  UpdateSecuritySettingsCommandHandler,
  UpdateGeneralSettingsCommandHandler,
  UpdateConnectivitySettingsCommandHandler,
  UpdateSmsSettingsCommandHandler,
  UpdateNotificationSettingsCommandHandler,
  CreateQueueCommandHandler,
  DeleteQueueCommandHandler,
  CreateResourceCommandHandler,
  DeleteResourceCommandHandler,
  UpdateTenantCommandHandler,
  SaveEntityAttributesCommandHandler,
  CreateRelationCommandHandler,
  DeleteRelationCommandHandler,
  SaveTenantProfileCommandHandler,
  SendNotificationCommandHandler,
  CreateNotificationTargetCommandHandler,
  CreateNotificationTemplateCommandHandler,
  CreateNotificationRuleCommandHandler,
  PreviewNotificationRequestCommandHandler,
  SaveWidgetBundleCommandHandler,
  UploadImageCommandHandler,
  DeleteImageCommandHandler,
  UpdateMailSettingsCommandHandler,
  DeleteWidgetTypeCommandHandler,
  SaveTwoFaSettingsCommandHandler,
  SaveWidgetTypeFqnsHandler,
  CreateOtaPackageCommandHandler,
  DeleteOtaPackageCommandHandler,
  CheckRepoAccessCommandHandler,
  SaveRepoSettingsCommandHandler,
  DeleteRepoSettingsCommandHandler,
  SaveTrendzSettingsCommandHandler,
  SaveAiModelCommandHandler,
  DeleteAiModelCommandHandler,
  CheckAiModelConnectivityCommandHandler,
  SaveAutoCommitSettingsCommandHandler,
  DeleteAutoCommitSettingsCommandHandler,
  CreateVersionCommandHandler,
  RestoreVersionHandler,
  CreateDomainCommandHandler,
  UpdateDomainCommandHandler,
  SaveOAuth2ClientCommandHandler,
  CreateRuleChainFullCommandHandler,
  DeleteRuleChainCommandHandler,
  SetRootRuleChainCommandHandler,
  SaveRuleChainMetadataCommandHandler,
  DeleteEntityAttributesCommandHandler,
];

import { FetchResourceInfoQueryHandler } from './application/queries/fetch-resource-info/fetch-resource-info.query.handler';

const queryHandlers = [
  FetchEntityEventsQueryHandler,
  FetchDevicesQueryHandler,
  FetchAssetsQueryHandler,
  FetchEntityViewsQueryHandler,
  FetchDeviceByIdQueryHandler,
  FetchDeviceSharedAttributesQueryHandler,
  FetchDeviceLatestTelemetryQueryHandler,
  FetchDeviceTelemetryKeysQueryHandler,
  FetchDeviceCalculatedFieldsQueryHandler,
  FetchDeviceAlarmsQueryHandler,
  FetchDeviceEventsQueryHandler,
  FetchDeviceAuditLogsQueryHandler,
  FetchDeviceRelationsQueryHandler,
  GetUserQueryHandler,
  FetchTenantsQueryHandler,
  FetchTenantUsersQueryHandler,
  FetchTenantDevicesQueryHandler,
  FetchNotificationsQueryHandler,
  FetchSecuritySettingsQueryHandler,
  FetchVersionQueryHandler,
  FetchGeneralSettingsQueryHandler,
  FetchConnectivitySettingsQueryHandler,
  FetchSmsSettingsQueryHandler,
  FetchNotificationSettingsQueryHandler,
  FetchQueuesQueryHandler,
  FetchResourcesQueryHandler,
  FetchResourceInfoQueryHandler,
  DownloadResourceQueryHandler,
  FetchTenantAttributesQueryHandler,
  FetchTenantAlarmsQueryHandler,
  FetchTenantEventsQueryHandler,
  FetchTenantRelationsQueryHandler,
  FetchTenantProfilesQueryHandler,
  FetchTenantProfileAttributesQueryHandler,
  FetchTenantProfileAlarmsQueryHandler,
  FetchImagesQueryHandler,
  DownloadImageQueryHandler,
  ExportImageQueryHandler,
  FetchMailSettingsQueryHandler,
  FetchWidgetTypesQueryHandler,
  FetchWidgetTypeByIdQueryHandler,
  SaveWidgetTypeCommandHandler,
  DownloadWidgetTypeQueryHandler,
  FetchDeliveryMethodsQueryHandler,
  FetchNotificationRequestsQueryHandler,
  FetchNotificationTargetsQueryHandler,
  FetchNotificationTemplatesQueryHandler,
  FetchNotificationRulesQueryHandler,
  FetchMaterialIconsQueryHandler,
  FetchWidgetBundlesQueryHandler,
  FetchWidgetBundleByIdQueryHandler,
  FetchAssetProfilesQueryHandler,
  FetchTwoFaSettingsQueryHandler,
  FetchWidgetsBundlesHandler,
  FetchWidgetTypeFqnsHandler,
  FetchOtaPackagesQueryHandler,
  DownloadOtaPackageQueryHandler,
  FetchDeviceProfileInfosQueryHandler,
  FetchDeviceProfilesQueryHandler,
  FetchRepoSettingsInfoQueryHandler,
  FetchRepoSettingsQueryHandler,
  FetchVersionsQueryHandler,
  FetchBranchesQueryHandler,
  FetchTrendzSettingsQueryHandler,
  FetchAiModelsQueryHandler,
  FetchAutoCommitSettingsQueryHandler,
  FetchVersionCreationStatusQueryHandler,
  FetchEntitiesByTypeQueryHandler,
  FetchRestoreVersionStatusHandler,
  FetchAuditLogsQueryHandler,
  FetchDomainInfosQueryHandler,
  FetchOAuth2ClientInfosQueryHandler,
  FetchDomainByIdQueryHandler,
  FetchOAuth2ConfigTemplateQueryHandler,
  FetchOAuth2ClientByIdHandler,
  FetchRuleChainsQueryHandler,
  FetchRuleChainByIdHandler,
  FetchRuleChainMetadataHandler,
  FetchVersionDiffQueryHandler,
  FetchEntityAttributesQueryHandler,
  FetchEntityAlarmsQueryHandler,
  FetchEntityRelationsQueryHandler,
  FetchEntityAuditLogsQueryHandler,
  FetchEntityTelemetryQueryHandler,
  FetchEntityTelemetryKeysQueryHandler,
  GetUserTokenQueryHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Thingsboard]),
    HttpModule,
    CqrsModule,
    forwardRef(() => ConnectionModule),
    forwardRef(() => MedplumModule),
    forwardRef(() => IamModule),
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
    StorageService,
    SysAdminAuthService,
  ],
  controllers: [ThingsboardController, DashboardController],
  exports: [
    THINGSBOARD_REPOSITORY_PORT,
    THINGSBOARD_API_PORT,
    THINGSBOARD_TELEMETRY_PORT,
    ThingsboardRollbackService,
    TelemetryService,
    StorageService,
    SysAdminAuthService,
  ],
})
export class ThingsboardModule {}
