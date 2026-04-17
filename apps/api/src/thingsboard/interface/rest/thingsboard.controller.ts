import {
  Controller,
  Post,
  Body,
  Get,
  Inject,
  UseGuards,
  Query,
  Param,
  Put,
  Delete, // Added Delete
  HttpCode,
  Res,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ThingsboardAuthGuard } from 'src/auth/guards/thingsboard-auth/thingsboard-auth.guard';
import { TbAccessToken } from 'src/auth/decorators/tb-access-token.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';

import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FetchDevicesQuery } from 'src/thingsboard/application/queries/fetch-devices/fetch-devices.query';
import { FetchAssetsQuery } from 'src/thingsboard/application/queries/fetch-assets/fetch-assets.query';
import { FetchEntityViewsQuery } from 'src/thingsboard/application/queries/fetch-entity-views/fetch-entity-views.query';
import { FetchResourcesQuery } from 'src/thingsboard/application/queries/fetch-resources/fetch-resources.query';
import { FetchResourceInfoQuery } from 'src/thingsboard/application/queries/fetch-resource-info/fetch-resource-info.query';
import { FetchDeviceRelationsQuery } from '../../application/queries/fetch-device-relations/fetch-device-relations.query';
import { match, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { FetchDeviceByIdQuery } from 'src/thingsboard/application/queries/fetch-device-by-id/fetch-device-by-id.query';
import { DeviceDetails } from './dtos/response/thingsboard-device.response.dto';

import {
  CreateAssetCommand,
  CreateAssetErrors,
} from 'src/thingsboard/application/commands/create-asset/create-asset.command';
import {
  CreateEntityViewCommand,
  CreateEntityViewErrors,
} from 'src/thingsboard/application/commands/create-entity-view/create-entity-view.command';
import { FetchEntityViewTypesCommand } from 'src/thingsboard/application/commands/fetch-entity-view-types/fetch-entity-view-types.command';
import {
  CreateDeviceCommand,
  CreateDeviceErrors,
} from 'src/thingsboard/application/commands/create-device/create-device.command';
import { Device } from './dtos/response/thingsboard-created-device.response.dto';
import type { CurrentUser } from 'src/auth/types/current-user';
import { CreateDeviceRequest } from './dtos/request/thingsboard-device.request.dto';
import { CreateAssetRequestDto } from './dtos/request/create-asset.request.dto';
import { CreateEntityViewRequestDto } from './dtos/request/create-entity-view.request.dto';
import { CreateNotificationTemplateRequestDto } from './dtos/request/create-notification-template.request.dto';
import { CreateNotificationRuleRequestDto } from './dtos/request/create-notification-rule.request.dto';
import { CreateNotificationRuleCommand } from '../../application/commands/create-notification-rule/create-notification-rule.command';
import { CreateNotificationTemplateCommand } from '../../application/commands/create-notification-template/create-notification-template.command';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { GetUserQuery } from 'src/thingsboard/application/queries/get-user/get-user.query';
import { ThingsboardLoginCommand } from 'src/thingsboard/application/commands/thingsboard-login/thingsboard-login.command';
import { RefreshTokenCommand } from 'src/thingsboard/application/commands/refresh-token/refresh-token.command';
import { ThingsboardLoginRequestDto } from './dtos/request/thingsboard-login.request.dto';
import {
  GetUserError,
  InvalidTokenError,
  InvalidCredentialsError,
  TokenRefreshError,
  ThingsboardConnectionNotFoundError,
} from 'src/thingsboard/domain/errors/thingsboard.errors';
import { FetchDeviceLatestTelemetryQuery } from 'src/thingsboard/application/queries/fetch-device-latest-telemetry/fetch-device-latest-telemetry.query';
import { FetchDeviceTelemetryKeysQuery } from 'src/thingsboard/application/queries/fetch-device-telemetry-keys/fetch-device-telemetry-keys.query';
import { FetchDeviceCalculatedFieldsQuery } from 'src/thingsboard/application/queries/fetch-device-calculated-fields/fetch-device-calculated-fields.query';
import { FetchDeviceAuditLogsQuery } from 'src/thingsboard/application/queries/fetch-device-audit-logs/fetch-device-audit-logs.query';
import { AddDeviceLatestTelemetryCommand } from 'src/thingsboard/application/commands/add-device-latest-telemetry/add-device-latest-telemetry.command';
import { CreateDeviceCalculatedFieldCommand } from 'src/thingsboard/application/commands/create-device-calculated-field/create-device-calculated-field.command';
import { DevicesResponse } from './dtos/response/thingsboard-devices.response.dto';
import { AssetsResponseDto } from './dtos/response/thingsboard-assets.response.dto';
import { AssetResponseDto } from './dtos/response/thingsboard-asset.response.dto';
import { EntityViewResponseDto } from './dtos/response/thingsboard-entity-view.response.dto';
import { EntityViewsResponseDto } from './dtos/response/thingsboard-entity-views.response.dto';
import { EntityViewTypeResponseDto } from './dtos/response/thingsboard-entity-view-type.response.dto';
import { ThingsboardTokensResponseDto } from './dtos/response/thingsboard-tokens.response.dto';
import { ThingsboardUserResponseDto } from './dtos/response/thingsboard-user.response.dto';
import { SecuritySettingsDto } from './dtos/request/thingsboard-security-settings.request.dto';
import { SecuritySettingsDto as SecuritySettingsDtoResponse } from './dtos/response/thingsboard-security-settings.response.dto';
import { FetchSecuritySettingsQuery } from 'src/thingsboard/application/queries/fetch-security-settings/fetch-security-settings.query';
import { UpdateSecuritySettingsCommand } from 'src/thingsboard/application/commands/update-security-settings/update-security-settings.command';
import { DashboardVersionResponse } from './dtos/response/thingsboard-version.response.dto';
import { FetchVersionQuery } from 'src/thingsboard/application/queries/fetch-version/fetch-version.query';
import { GeneralSettingsDto } from './dtos/response/general-settings.response.dto';
import { GeneralSettingsRequestDto } from './dtos/request/general-settings.request.dto';
import { FetchGeneralSettingsQuery } from 'src/thingsboard/application/queries/fetch-general-settings/fetch-general-settings.query';
import { UpdateGeneralSettingsCommand } from 'src/thingsboard/application/commands/update-general-settings/update-general-settings.command';
import { ConnectivitySettingsDto } from './dtos/response/connectivity-settings.response.dto';
import { ConnectivitySettingsRequestDto } from './dtos/request/connectivity-settings.request.dto';
import { FetchConnectivitySettingsQuery } from 'src/thingsboard/application/queries/fetch-connectivity-settings/fetch-connectivity-settings.query';
import { UpdateConnectivitySettingsCommand } from 'src/thingsboard/application/commands/update-connectivity-settings/update-connectivity-settings.command';
import { SmsSettingsDto } from './dtos/response/sms-settings.response.dto';
import { FetchSmsSettingsQuery } from 'src/thingsboard/application/queries/fetch-sms-settings/fetch-sms-settings.query';
import { UpdateSmsSettingsCommand } from 'src/thingsboard/application/commands/update-sms-settings/update-sms-settings.command';
import { NotificationSettingsDto } from './dtos/response/notification-settings.response.dto';
import { FetchNotificationSettingsQuery } from 'src/thingsboard/application/queries/fetch-notification-settings/fetch-notification-settings.query';
import { UpdateNotificationSettingsCommand } from 'src/thingsboard/application/commands/update-notification-settings/update-notification-settings.command';
import { MailSettingsDto } from './dtos/response/mail-settings.response.dto';

import { FetchMailSettingsQuery } from 'src/thingsboard/application/queries/fetch-mail-settings/fetch-mail-settings.query';
import { UpdateMailSettingsCommand } from 'src/thingsboard/application/commands/update-mail-settings/update-mail-settings.command';
import {
  QueueDto,
  QueuesPageResponseDto,
} from './dtos/response/queue.response.dto';
import { FetchQueuesQuery } from 'src/thingsboard/application/queries/fetch-queues/fetch-queues.query';
import { CreateQueueCommand } from 'src/thingsboard/application/commands/create-queue/create-queue.command';
import { DeleteQueueCommand } from 'src/thingsboard/application/commands/delete-queue/delete-queue.command';
import {
  ResourceDto,
  ResourceCreateDto,
  ResourcesPageResponseDto,
} from './dtos/response/resource.response.dto';
import { CreateResourceCommand } from 'src/thingsboard/application/commands/create-resource/create-resource.command';
import { DeleteResourceCommand } from 'src/thingsboard/application/commands/delete-resource/delete-resource.command';
import { DownloadResourceQuery } from 'src/thingsboard/application/queries/download-resource/download-resource.query';
import {
  ImageDto,
  ImagesPageResponseDto,
  ImageExportDto,
  DeleteImageResponseDto,
} from './dtos/response/image.response.dto';
import { FetchImagesQuery } from 'src/thingsboard/application/queries/fetch-images/fetch-images.query';
import { UploadImageCommand } from 'src/thingsboard/application/commands/upload-image/upload-image.command';
import { DeleteImageCommand } from 'src/thingsboard/application/commands/delete-image/delete-image.command';
import { DownloadImageQuery } from 'src/thingsboard/application/queries/download-image/download-image.query';
import { ExportImageQuery } from 'src/thingsboard/application/queries/export-image/export-image.query';
import {
  CreateWidgetTypeRequestDto,
  WidgetTypeDto,
  WidgetTypesPageDto,
} from './dtos/response/widget-types.response.dto';
import { FetchWidgetTypesQuery } from 'src/thingsboard/application/queries/fetch-widget-types/fetch-widget-types.query';
import { DeleteWidgetTypeCommand } from 'src/thingsboard/application/commands/delete-widget-type/delete-widget-type.command';
import { SaveWidgetTypeCommand } from 'src/thingsboard/application/commands/save-widget-type/save-widget-type.command';
import { FetchWidgetTypeByIdQuery } from 'src/thingsboard/application/queries/fetch-widget-type-by-id/fetch-widget-type-by-id.query';
import { DownloadWidgetTypeQuery } from 'src/thingsboard/application/queries/download-widget-type/download-widget-type.query';
import { SendNotificationRequestDto } from './dtos/request/send-notification.request.dto';
import { DeliveryMethodsResponse } from './dtos/response/delivery-methods.response.dto';
import { NotificationRequestResponse } from './dtos/response/notification-request.response.dto';
import { FetchDeliveryMethodsQuery } from 'src/thingsboard/application/queries/fetch-delivery-methods/fetch-delivery-methods.query';
import { SendNotificationCommand } from 'src/thingsboard/application/commands/send-notification/send-notification.command';
import { CreateNotificationTargetCommand } from 'src/thingsboard/application/commands/create-notification-target/create-notification-target.command';
import { FetchNotificationTargetsQuery } from 'src/thingsboard/application/queries/fetch-notification-targets/fetch-notification-targets.query';
import { FetchNotificationTemplatesQuery } from 'src/thingsboard/application/queries/fetch-notification-templates/fetch-notification-templates.query';
import { FetchNotificationRulesQuery } from 'src/thingsboard/application/queries/fetch-notification-rules/fetch-notification-rules.query';
import { CreateNotificationTargetRequestDto } from './dtos/request/create-notification-target.request.dto';
import { PreviewNotificationRequestCommand } from 'src/thingsboard/application/commands/preview-notification-request/preview-notification-request.command';
import { FetchWidgetBundlesQuery } from 'src/thingsboard/application/queries/fetch-widget-bundles/fetch-widget-bundles.query';
import {
  WidgetBundleDto,
  WidgetBundlesPageDto,
} from './dtos/response/widget-bundles.response.dto';
import { SaveWidgetBundleCommand } from 'src/thingsboard/application/commands/save-widget-bundle/save-widget-bundle.command';
import { SaveWidgetBundleRequestDto } from './dtos/request/save-widget-bundle.request.dto';
import { FetchWidgetBundleByIdQuery } from 'src/thingsboard/application/queries/fetch-widget-bundle-by-id/fetch-widget-bundle-by-id.query';
import { FetchMaterialIconsQuery } from 'src/thingsboard/application/queries/fetch-material-icons/fetch-material-icons.query';
import { FetchNotificationRequestsQuery } from 'src/thingsboard/application/queries/fetch-notification-requests/fetch-notification-requests.query';
import { TwoFactorAuthSettingsDto } from './dtos/response/thingsboard-2fa-settings.response.dto';
import { TwoFactorAuthSettingsRequestDto } from './dtos/request/thingsboard-2fa-settings.request.dto';
import { FetchTwoFaSettingsQuery } from '../../application/queries/fetch-2fa-settings/fetch-2fa-settings.query';
import { SaveTwoFaSettingsCommand } from '../../application/commands/save-2fa-settings/save-2fa-settings.command';
import { FetchWidgetsBundlesQuery } from '../../application/queries/fetch-widgets-bundles/fetch-widgets-bundles.query';
import { FetchWidgetTypeFqnsQuery } from '../../application/queries/fetch-widget-type-fqns/fetch-widget-type-fqns.query';
import { SaveWidgetTypeFqnsCommand } from '../../application/commands/save-widget-type-fqns/save-widget-type-fqns.command';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/iam/domain/enums/role.enum';
import {
  THINGSBOARD_API_PORT,
  Asset,
  AssetProfilesResponse,
  AssetProfileInfo,
  AssetProfileInfosResponse,
  CustomerDetails,
  CustomersResponse,
  DeviceProfilesResponse,
  EntityAuditLogsResponse,
  EntityViewTypeInfo,
  EntityView,
  ThingsboardApiPort,
} from 'src/thingsboard/application/ports/thingsboard.api.port';
import { FetchOtaPackagesQuery } from 'src/thingsboard/application/queries/fetch-ota-packages/fetch-ota-packages.query';
import { DownloadOtaPackageQuery } from 'src/thingsboard/application/queries/download-ota-package/download-ota-package.query';
import { CreateOtaPackageCommand } from 'src/thingsboard/application/commands/create-ota-package/create-ota-package.command';
import { DeleteOtaPackageCommand } from 'src/thingsboard/application/commands/delete-ota-package/delete-ota-package.command';
import { CreateOtaPackageRequestDto } from './dtos/request/create-ota-package.request.dto';
import { OtaPackagesPageResponseDto } from './dtos/response/ota-package.response.dto';
import { FetchAssetProfilesQuery } from 'src/thingsboard/application/queries/fetch-asset-profiles/fetch-asset-profiles.query';
import { FetchDeviceProfileInfosQuery } from 'src/thingsboard/application/queries/fetch-device-profile-infos/fetch-device-profile-infos.query';
import { FetchDeviceProfilesQuery } from 'src/thingsboard/application/queries/fetch-device-profiles/fetch-device-profiles.query';
import { AssetProfilesResponseDto } from './dtos/response/thingsboard-asset-profiles.response.dto';
import { DeviceProfilesResponseDto } from './dtos/response/thingsboard-device-profiles.response.dto';
import { FetchRepoSettingsInfoQuery } from 'src/thingsboard/application/queries/fetch-repo-settings-info/fetch-repo-settings-info.query';
import { FetchRepoSettingsQuery } from 'src/thingsboard/application/queries/fetch-repo-settings/fetch-repo-settings.query';
import { FetchVersionsQuery } from 'src/thingsboard/application/queries/fetch-versions/fetch-versions.query';
import { FetchVersionDiffQuery } from 'src/thingsboard/application/queries/fetch-version-diff/fetch-version-diff.query';
import { CheckRepoAccessCommand } from 'src/thingsboard/application/commands/check-repo-access/check-repo-access.command';
import { SaveRepoSettingsCommand } from 'src/thingsboard/application/commands/save-repo-settings/save-repo-settings.command';
import { DeleteRepoSettingsCommand } from 'src/thingsboard/application/commands/delete-repo-settings/delete-repo-settings.command';
import { FetchBranchesQuery } from 'src/thingsboard/application/queries/fetch-branches/fetch-branches.query';
import { FetchTrendzSettingsQuery } from 'src/thingsboard/application/queries/fetch-trendz-settings/fetch-trendz-settings.query';
import { SaveTrendzSettingsCommand } from 'src/thingsboard/application/commands/save-trendz-settings/save-trendz-settings.command';
import { FetchAiModelsQuery } from 'src/thingsboard/application/queries/fetch-ai-models/fetch-ai-models.query';
import { SaveAiModelCommand } from 'src/thingsboard/application/commands/save-ai-model/save-ai-model.command';
import { DeleteAiModelCommand } from 'src/thingsboard/application/commands/delete-ai-model/delete-ai-model.command';
import { CheckAiModelConnectivityCommand } from 'src/thingsboard/application/commands/check-ai-model-connectivity/check-ai-model-connectivity.command';
import { FetchAutoCommitSettingsQuery } from 'src/thingsboard/application/queries/fetch-auto-commit-settings/fetch-auto-commit-settings.query';
import { SaveAutoCommitSettingsCommand } from 'src/thingsboard/application/commands/save-auto-commit-settings/save-auto-commit-settings.command';
import { DeleteAutoCommitSettingsCommand } from 'src/thingsboard/application/commands/delete-auto-commit-settings/delete-auto-commit-settings.command';
import { CreateVersionCommand } from 'src/thingsboard/application/commands/create-version/create-version.command';
import { FetchVersionCreationStatusQuery } from 'src/thingsboard/application/queries/fetch-version-creation-status/fetch-version-creation-status.query';
import { FetchEntitiesByTypeQuery } from 'src/thingsboard/application/queries/fetch-entities-by-type/fetch-entities-by-type.query';
import { FetchRestoreVersionStatusQuery } from 'src/thingsboard/application/queries/fetch-restore-version-status/fetch-restore-version-status.query';
import { RestoreVersionCommand } from 'src/thingsboard/application/commands/restore-version/restore-version.command';
import { FetchAuditLogsQuery } from 'src/thingsboard/application/queries/fetch-audit-logs/fetch-audit-logs.query';
import { FetchDomainInfosQuery } from 'src/thingsboard/application/queries/fetch-domain-infos/fetch-domain-infos.query';
import { FetchOAuth2ClientInfosQuery } from 'src/thingsboard/application/queries/fetch-oauth2-client-infos/fetch-oauth2-client-infos.query';
import { CreateDomainCommand } from 'src/thingsboard/application/commands/create-domain/create-domain.command';
import { FetchDomainByIdQuery } from 'src/thingsboard/application/queries/fetch-domain-by-id/fetch-domain-by-id.query';
import { UpdateDomainCommand } from 'src/thingsboard/application/commands/update-domain/update-domain.command';
import { FetchOAuth2ConfigTemplateQuery } from 'src/thingsboard/application/queries/fetch-oauth2-config-template/fetch-oauth2-config-template.query';
import { SaveOAuth2ClientCommand } from 'src/thingsboard/application/commands/save-oauth2-client/save-oauth2-client.command';
import { FetchOAuth2ClientByIdQuery } from 'src/thingsboard/application/queries/fetch-oauth2-client-by-id/fetch-oauth2-client-by-id.query';
import { FetchRuleChainsQuery } from 'src/thingsboard/application/queries/fetch-rule-chains/fetch-rule-chains.query';
import { CreateRuleChainFullCommand } from 'src/thingsboard/application/commands/create-rule-chain-full/create-rule-chain-full.command';
import { DeleteRuleChainCommand } from 'src/thingsboard/application/commands/delete-rule-chain/delete-rule-chain.command';
import { FetchRuleChainMetadataQuery } from 'src/thingsboard/application/queries/fetch-rule-chain-metadata/fetch-rule-chain-metadata.query';
import { SetRootRuleChainCommand } from 'src/thingsboard/application/commands/set-root-rule-chain/set-root-rule-chain.command';
import { SaveRuleChainMetadataCommand } from 'src/thingsboard/application/commands/save-rule-chain-metadata/save-rule-chain-metadata.command';
import { FetchRuleChainByIdQuery } from 'src/thingsboard/application/queries/fetch-rule-chain-by-id/fetch-rule-chain-by-id.query';
import { SaveEntityAttributesCommand } from 'src/thingsboard/application/commands/save-entity-attributes/save-entity-attributes.command';
import { DeleteEntityAttributesCommand } from 'src/thingsboard/application/commands/delete-entity-attributes/delete-entity-attributes.command';
import { FetchEntityAttributesQuery } from 'src/thingsboard/application/queries/fetch-entity-attributes/fetch-entity-attributes.query';
import { FetchEntityAlarmsQuery } from 'src/thingsboard/application/queries/fetch-entity-alarms/fetch-entity-alarms.query';
import { FetchEntityRelationsQuery } from 'src/thingsboard/application/queries/fetch-entity-relations/fetch-entity-relations.query';
import { FetchEntityAuditLogsQuery } from 'src/thingsboard/application/queries/fetch-entity-audit-logs/fetch-entity-audit-logs.query';
import { FetchEntityTelemetryQuery } from 'src/thingsboard/application/queries/fetch-entity-telemetry/fetch-entity-telemetry.query';
import { FetchEntityTelemetryKeysQuery } from 'src/thingsboard/application/queries/fetch-entity-telemetry-keys/fetch-entity-telemetry-keys.query';
import { FetchEntityEventsQuery } from 'src/thingsboard/application/queries/fetch-entity-events/fetch-entity-events.query';
import { CreateRelationCommand } from 'src/thingsboard/application/commands/create-relation/create-relation.command';
import { DeleteRelationCommand } from 'src/thingsboard/application/commands/delete-relation/delete-relation.command';

@ApiTags('ThingsBoard')
@Controller('thingsboard')
export class ThingsboardController {
  private readonly logger = new Logger(ThingsboardController.name);
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) { }

  @UseGuards(ThingsboardAuthGuard)
  @Get('embed-token')
  @ApiOperation({
    summary: 'Get ThingsBoard JWT token for Iframe embedding',
  })
  getEmbedToken(@TbAccessToken() accessToken: string) {
    if (!accessToken) {
      throw new UnauthorizedException(
        'No token generated. Try logging in again.',
      );
    }
    return {
      jwtToken: accessToken,
    };
  }

  @Public()
  @Post('/login')
  @ApiOperation({
    summary: '(NOT USED) Login to ThingsBoard',
    description:
      'Authenticate user with ThingsBoard using username and password',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged in with access and refresh tokens',
    type: ThingsboardTokensResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials (invalid username or password)',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists in ThingsBoard',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'ThingsBoard connection failed',
  })
  async login(
    @Body() loginDto: ThingsboardLoginRequestDto,
    @ActiveUser() user: CurrentUser,
  ) {
    const command = new ThingsboardLoginCommand(
      user.id,
      loginDto.username,
      loginDto.password,
    );
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response) => response,
      Err: (error) => {
        if (error instanceof InvalidCredentialsError) {
          throw new UnauthorizedException(error.message);
        }
        throw new InternalServerErrorException(
          'Failed to login to ThingsBoard',
        );
      },
    });
  }

  @Post('/refresh')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Refresh ThingsBoard token',
    description:
      'Generate new access token using thingsboard refresh token from our database',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    type: ThingsboardTokensResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Token refresh failed or token has expired',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'ThingsBoard connection not found for user',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to refresh token',
  })
  async refresh(@ActiveUser() user: CurrentUser) {
    const command = new RefreshTokenCommand(user.id);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response) => response,
      Err: (error) => {
        if (error instanceof TokenRefreshError) {
          throw new BadRequestException(error.message);
        }
        if (error instanceof ThingsboardConnectionNotFoundError) {
          throw new NotFoundException(error.message);
        }
        throw new InternalServerErrorException('Failed to refresh token');
      },
    });
  }

  @UseGuards(ThingsboardAuthGuard)
  @Get('/user')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '(NOT USED) Get current ThingsBoard user',
    description:
      'Retrieve information about the currently authenticated ThingsBoard user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User information retrieved successfully',
    type: ThingsboardUserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'ThingsBoard connection failed',
  })
  async getUser(@TbAccessToken() accessToken: string) {
    const query = new GetUserQuery(accessToken);
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (user) => user,
      Err: (error: GetUserError) => {
        if (error instanceof InvalidTokenError) {
          throw new UnauthorizedException(error.message);
        }
        throw new InternalServerErrorException('Failed to fetch user');
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/devices')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list of devices',
    description: 'Fetch paginated list of devices from ThingsBoard',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (zero-based)',
    example: 0,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of devices retrieved successfully',
    type: DevicesResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch devices from ThingsBoard',
  })
  async getDevices(
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('deviceIds') deviceIds?: string,
  ) {
    const query = new FetchDevicesQuery({
      accessToken,
      page: Number(page),
      pageSize: Number(pageSize),
      sortProperty,
      sortOrder,
      deviceIds,
    });
    const result: Result<DevicesResponse, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (devicesResponse: DevicesResponse) => devicesResponse,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/gateways')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list of gateways',
    description:
      'Fetch paginated list of gateways with enabled connectors and version',
  })
  async getGateways(
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const normalizedPage = Math.max(0, Number(page));
    const normalizedPageSize = Math.max(1, Number(pageSize));
    const batchSize = 100;
    const allDevices: any[] = [];
    let currentPage = 0;
    let hasNext = true;

    while (hasNext) {
      const response = await this.thingsboardApi.fetchDevices(
        accessToken,
        currentPage,
        batchSize,
        sortProperty,
        sortOrder,
      );

      allDevices.push(...((response?.data as any[]) ?? []));
      hasNext = Boolean(response?.hasNext);
      currentPage += 1;

      if (currentPage > 1000) {
        break;
      }
    }

    const gateways = allDevices.filter((device) =>
      Boolean(device?.additionalInfo?.gateway),
    );

    const startIndex = normalizedPage * normalizedPageSize;
    const pagedGateways = gateways.slice(
      startIndex,
      startIndex + normalizedPageSize,
    );

    const data = await Promise.all(
      pagedGateways.map(async (gateway) => {
        const gatewayId = gateway?.id?.id;
        let attributes: Array<{ key: string; value: unknown }> = [];

        if (gatewayId) {
          try {
            attributes = (await this.thingsboardApi.fetchDeviceSharedAttributes(
              accessToken,
              gatewayId,
            )) as Array<{ key: string; value: unknown }>;
          } catch (error) {
            this.logger.warn(
              `Failed to fetch shared attributes for gateway ${gatewayId}`,
            );
          }
        }

        const attributeMap = new Map(
          attributes.map((attribute) => [attribute.key, attribute.value]),
        );

        const connectorsValue =
          attributeMap.get('active_connectors') ??
          attributeMap.get('activeConnectors');
        const versionValue =
          attributeMap.get('Version') ?? attributeMap.get('version');

        let enabledConnectors = 0;
        if (typeof connectorsValue === 'string' && connectorsValue.length > 0) {
          try {
            const parsed = JSON.parse(connectorsValue);
            enabledConnectors = Array.isArray(parsed) ? parsed.length : 0;
          } catch {
            enabledConnectors = 0;
          }
        } else if (Array.isArray(connectorsValue)) {
          enabledConnectors = connectorsValue.length;
        }

        return {
          ...gateway,
          enabledConnectors,
          gatewayVersion:
            typeof versionValue === 'string'
              ? versionValue
              : versionValue != null
                ? // eslint-disable-next-line @typescript-eslint/no-base-to-string
                String(versionValue)
                : null,
        };
      }),
    );

    return {
      data,
      totalPages: Math.ceil(gateways.length / normalizedPageSize),
      totalElements: gateways.length,
      hasNext: startIndex + normalizedPageSize < gateways.length,
    };
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/gateways/:id/configuration')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get gateway configuration data',
    description:
      'Fetch client attributes, specific shared attributes, and credentials for a gateway device',
  })
  async getGatewayConfiguration(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    const CONFIG_KEYS = [
      'general_configuration',
      'grpc_configuration',
      'logs_configuration',
      'storage_configuration',
      'RemoteLoggingLevel',
      'mode',
    ];

    const [clientAttributes, allShared, credentials] = await Promise.all([
      this.thingsboardApi
        .fetchEntityAttributes(accessToken, 'DEVICE', id, 'CLIENT_SCOPE')
        .catch(() => []),
      this.thingsboardApi
        .fetchEntityAttributes(accessToken, 'DEVICE', id, 'SHARED_SCOPE')
        .catch(() => []),
      this.thingsboardApi
        .getDeviceCredentials(accessToken, id)
        .catch(() => null),
    ]);

    const sharedAttributes = (allShared as any[]).filter((attr) =>
      CONFIG_KEYS.includes(attr?.key),
    );

    return { clientAttributes, sharedAttributes, credentials };
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/gateways/:id/docker-compose')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download docker-compose.yml for a gateway',
    description:
      'Proxy download of docker-compose.yml from ThingsBoard device-connectivity API',
  })
  async getGatewayDockerCompose(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Res() res: any,
  ) {
    const fileBuffer = await this.thingsboardApi.fetchGatewayDockerCompose(
      accessToken,
      id,
    );
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="docker-compose.yml"',
    });
    res.send(fileBuffer);
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/gateways/:id/connectors')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get gateway connectors data',
    description:
      'Fetch active and inactive connectors, gateway version and active connector details',
  })
  async getGatewayConnectors(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    const [activeAttr, inactiveAttr, versionAttr, sharedAll] =
      await Promise.all([
        this.thingsboardApi
          .fetchEntityAttributes(accessToken, 'DEVICE', id, 'SHARED_SCOPE', [
            'active_connectors',
          ])
          .catch(() => []),
        this.thingsboardApi
          .fetchEntityAttributes(accessToken, 'DEVICE', id, 'SERVER_SCOPE', [
            'inactive_connectors',
          ])
          .catch(() => []),
        this.thingsboardApi
          .fetchEntityAttributes(accessToken, 'DEVICE', id, 'CLIENT_SCOPE', [
            'Version',
          ])
          .catch(() => []),
        this.thingsboardApi
          .fetchEntityAttributes(accessToken, 'DEVICE', id, 'SHARED_SCOPE')
          .catch(() => []),
      ]);

    const activeConnectorsRaw = (activeAttr as any[]).find(
      (attr) => attr?.key === 'active_connectors',
    )?.value;
    const inactiveConnectorsRaw = (inactiveAttr as any[]).find(
      (attr) => attr?.key === 'inactive_connectors',
    )?.value;
    const versionRaw = (versionAttr as any[]).find(
      (attr) => attr?.key === 'Version',
    )?.value;

    const activeConnectors = Array.isArray(activeConnectorsRaw)
      ? activeConnectorsRaw.map((name) => String(name))
      : [];
    const inactiveConnectors = Array.isArray(inactiveConnectorsRaw)
      ? inactiveConnectorsRaw.map((name) => String(name))
      : [];

    const sharedMap = new Map<string, any>(
      (sharedAll as any[])
        .filter((attr) => attr?.key)
        .map((attr) => [String(attr.key), attr.value]),
    );

    const connectors = activeConnectors.map((name) => ({
      name,
      status: inactiveConnectors.includes(name) ? 'inactive' : 'active',
      config: sharedMap.get(name) ?? null,
    }));

    return {
      activeConnectors,
      inactiveConnectors,
      version: versionRaw != null ? String(versionRaw) : null,
      connectors,
    };
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/gateways/:id/connectors')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add gateway connector',
    description:
      'Adds connector name to active_connectors and creates connector configuration in shared attributes',
  })
  async addGatewayConnector(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body()
    payload: {
      name: string;
      type?: string;
      logLevel?: string;
      useDefaults?: boolean;
      sendDataOnlyOnChange?: boolean;
    },
  ) {
    const name = String(payload?.name ?? '').trim();
    if (!name) {
      throw new BadRequestException('Connector name is required');
    }

    const connectorType = String(payload?.type ?? 'mqtt').trim() || 'mqtt';
    const logLevel = String(payload?.logLevel ?? 'INFO').trim() || 'INFO';

    const [activeAttr, existingConnectorAttr] = await Promise.all([
      this.thingsboardApi
        .fetchEntityAttributes(accessToken, 'DEVICE', id, 'SHARED_SCOPE', [
          'active_connectors',
        ])
        .catch(() => []),
      this.thingsboardApi
        .fetchEntityAttributes(accessToken, 'DEVICE', id, 'SHARED_SCOPE', [
          name,
        ])
        .catch(() => []),
    ]);

    const existingConnector = (existingConnectorAttr as any[]).find(
      (attr) => attr?.key === name,
    );

    if (existingConnector) {
      throw new BadRequestException(`Connector "${name}" already exists`);
    }

    const activeRaw = (activeAttr as any[]).find(
      (attr) => attr?.key === 'active_connectors',
    )?.value;
    const activeConnectors = Array.isArray(activeRaw)
      ? activeRaw.map((item) => String(item))
      : [];
    const nextActiveConnectors = Array.from(
      new Set([...activeConnectors, name]),
    );

    await this.thingsboardApi.saveEntityAttributes(
      accessToken,
      'DEVICE',
      id,
      'SHARED_SCOPE',
      {
        active_connectors: nextActiveConnectors,
      },
    );

    const connectorConfig = {
      type: connectorType,
      name,
      logLevel,
      useDefaults:
        typeof payload?.useDefaults === 'boolean' ? payload.useDefaults : true,
      sendDataOnlyOnChange:
        typeof payload?.sendDataOnlyOnChange === 'boolean'
          ? payload.sendDataOnlyOnChange
          : false,
      configurationJson: {
        broker: {
          name: 'Default Local Broker',
          host: '127.0.0.1',
          port: 1883,
          clientId: 'ThingsBoard_gateway',
          version: 5,
          maxMessageNumberPerWorker: 10,
          maxNumberOfWorkers: 100,
          sendDataOnlyOnChange: false,
          security: {
            type: 'basic',
            username: 'user',
            password: 'password',
          },
        },
        mapping: [
          {
            topicFilter: 'sensor/data',
            converter: {
              type: 'json',
              deviceNameJsonExpression: '${serialNumber}',
              deviceTypeJsonExpression: '${sensorType}',
              sendDataOnlyOnChange: false,
              timeout: 60000,
              attributes: [
                { type: 'string', key: 'model', value: '${sensorModel}' },
              ],
              timeseries: [
                { type: 'double', key: 'temperature', value: '${temp}' },
                { type: 'double', key: 'humidity', value: '${hum}' },
              ],
            },
          },
        ],
      },
      configuration: `${name}.json`,
      ts: Date.now(),
    };

    await this.thingsboardApi.saveEntityAttributes(
      accessToken,
      'DEVICE',
      id,
      'SHARED_SCOPE',
      {
        [name]: connectorConfig,
      },
    );

    return { success: true, name };
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/assets')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list of assets',
    description: 'Fetch paginated list of asset infos from ThingsBoard',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 0,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'sortProperty',
    required: false,
    type: String,
    example: 'createdTime',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @ApiQuery({
    name: 'assetProfileId',
    required: false,
    type: String,
    example: '',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of assets retrieved successfully',
    type: AssetsResponseDto,
  })
  async getAssets(
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('assetProfileId') assetProfileId = '',
    @Query('assetIds') assetIds?: string,
  ) {
    const query = new FetchAssetsQuery({
      accessToken,
      page: Number(page),
      pageSize: Number(pageSize),
      sortProperty,
      sortOrder,
      assetProfileId,
      assetIds,
    });

    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (assetsResponse) => assetsResponse,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/assets')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new asset',
    description: 'Create a new asset in ThingsBoard',
  })
  @ApiBody({ type: CreateAssetRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Asset created successfully',
    type: AssetResponseDto,
  })
  async createAsset(
    @TbAccessToken() accessToken: string,
    @Body() payload: CreateAssetRequestDto,
  ) {
    const command = new CreateAssetCommand({
      accessToken,
      payload: {
        name: payload.name,
        label: payload.label ?? null,
        type: 'default',
        assetProfileId: {
          entityType: 'ASSET_PROFILE',
          id: payload.assetProfileId,
        },
        customerId: payload.customerId
          ? { entityType: 'CUSTOMER', id: payload.customerId }
          : null,
        additionalInfo: {
          description: payload.description ?? '',
        },
      },
    });

    const result: Result<Asset, CreateAssetErrors> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (asset) => asset,
      Err: (error: CreateAssetErrors) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get(['/entity-views/types', '/entityView/types'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get entity view types',
    description: 'Fetch entity view types from ThingsBoard',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Entity view types retrieved successfully',
    type: EntityViewTypeResponseDto,
    isArray: true,
  })
  async getEntityViewTypes(@TbAccessToken() accessToken: string) {
    const command = new FetchEntityViewTypesCommand({ accessToken });
    const result: Result<EntityViewTypeInfo[], ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (entityViewTypes) => entityViewTypes,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entity-views')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list of entity views',
    description: 'Fetch paginated list of entity view infos from ThingsBoard',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortProperty',
    required: false,
    type: String,
    example: 'createdTime',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @ApiQuery({ name: 'type', required: false, type: String, example: '' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of entity views retrieved successfully',
    type: EntityViewsResponseDto,
  })
  async getEntityViews(
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('type') type = '',
  ) {
    const query = new FetchEntityViewsQuery({
      accessToken,
      page: Number(page),
      pageSize: Number(pageSize),
      sortProperty,
      sortOrder,
      type,
    });

    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (entityViewsResponse) => entityViewsResponse,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/entity-views')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new entity view',
    description: 'Create a new entity view in ThingsBoard',
  })
  @ApiBody({ type: CreateEntityViewRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Entity view created successfully',
    type: EntityViewResponseDto,
  })
  async createEntityView(
    @TbAccessToken() accessToken: string,
    @Body() payload: CreateEntityViewRequestDto,
  ) {
    const attributeKeys = {
      cs: payload.clientAttributes ?? [],
      sh: payload.sharedAttributes ?? [],
      ss: payload.serverAttributes ?? [],
    };

    const timeseriesKeys = payload.timeSeries ?? [];

    const command = new CreateEntityViewCommand({
      accessToken,
      payload: {
        entityId: {
          entityType: payload.entityType,
          id: payload.entityId,
        },
        name: payload.name,
        type: payload.type,
        keys: {
          attributes: attributeKeys,
          timeseries: timeseriesKeys,
        },
        startTimeMs: payload.startTimeMs ?? 0,
        endTimeMs: payload.endTimeMs ?? 0,
        additionalInfo: {
          description: payload.description ?? '',
        },
      },
    });

    const result: Result<EntityView, CreateEntityViewErrors> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (entityView) => entityView,
      Err: (error: CreateEntityViewErrors) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entity-views/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get entity view by ID',
    description: 'Retrieve detailed information about a specific entity view',
  })
  async getEntityView(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.thingsboardApi.fetchEntityView(accessToken, id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch entity view');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Put('/entity-views/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update entity view by ID',
    description: 'Update selected entity view details in ThingsBoard',
  })
  async updateEntityView(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
  ) {
    try {
      return await this.thingsboardApi.saveEntityView(accessToken, {
        ...payload,
        id: {
          entityType: 'ENTITY_VIEW',
          id,
        },
      } as any);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update entity view');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entity-views/:id/attributes')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get entity view server attributes',
    description: 'Retrieve server attributes for a specific entity view',
  })
  async getEntityViewAttributes(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('scope') scopeParam?: string,
  ) {
    const scope = (scopeParam || 'SERVER_SCOPE').toUpperCase() as any;
    if (
      scope !== 'SERVER_SCOPE' &&
      scope !== 'CLIENT_SCOPE' &&
      scope !== 'SHARED_SCOPE'
    ) {
      throw new BadRequestException('Invalid scope value');
    }

    try {
      return await this.thingsboardApi.fetchEntityAttributes(
        accessToken,
        'ENTITY_VIEW',
        id,
        scope,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch entity view attributes',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/entity-views/:id/attributes')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update entity view server attributes',
    description: 'Update server attributes for a specific entity view',
  })
  async postEntityViewAttributes(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body() attributes: Record<string, any>,
    @Query('scope') scopeParam?: string,
  ) {
    const scope = (scopeParam || 'SERVER_SCOPE').toUpperCase() as any;
    if (scope !== 'SERVER_SCOPE' && scope !== 'SHARED_SCOPE') {
      throw new BadRequestException(
        'Only SERVER_SCOPE and SHARED_SCOPE are allowed for updates',
      );
    }

    try {
      await this.thingsboardApi.saveEntityAttributes(
        accessToken,
        'ENTITY_VIEW',
        id,
        scope,
        attributes,
      );
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update entity view attributes',
      );
    }
  }

  @Roles(Role.MODERATOR)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entity-views/:id/telemetry/latest')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get latest entity view telemetry',
    description:
      'Retrieve latest telemetry values for selected entity view keys',
  })
  async getEntityViewLatestTelemetry(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('keys') keysParam: string,
  ) {
    const keys = (keysParam || '')
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);

    if (!keys.length) {
      throw new BadRequestException('Query parameter "keys" is required');
    }

    try {
      return await this.thingsboardApi.fetchEntityViewLatestTelemetry(
        accessToken,
        id,
        keys,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch latest entity view telemetry',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entity-views/:id/telemetry/latest/keys')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get latest entity view telemetry keys',
    description: 'Retrieve all known latest telemetry keys for an entity view',
  })
  async getEntityViewLatestTelemetryKeys(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.thingsboardApi.fetchEntityViewTelemetryKeys(
        accessToken,
        id,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch entity view telemetry keys',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entity-views/:id/alarms')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get entity view alarms' })
  async getEntityViewAlarms(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('statusList') statusList?: string,
    @Query('severityList') severityList?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    try {
      return await this.thingsboardApi.fetchEntityAlarms(
        accessToken,
        'ENTITY_VIEW',
        id,
        Number(page),
        Number(pageSize),
        statusList
          ?.split(',')
          .map((it) => it.trim())
          .filter(Boolean),
        severityList
          ?.split(',')
          .map((it) => it.trim())
          .filter(Boolean),
        startTime ? Number(startTime) : undefined,
        endTime ? Number(endTime) : undefined,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch entity view alarms',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entity-views/:id/events')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get entity view events' })
  async getEntityViewEvents(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('eventType') eventType?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    try {
      return await this.thingsboardApi.fetchEntityEvents(
        accessToken,
        'ENTITY_VIEW',
        id,
        Number(page),
        Number(pageSize),
        eventType,
        startTime ? Number(startTime) : undefined,
        endTime ? Number(endTime) : undefined,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch entity view events',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entity-views/:id/audit-logs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get entity view audit logs' })
  async getEntityViewAuditLogs(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    try {
      return await this.thingsboardApi.fetchEntityAuditLogs(
        accessToken,
        'ENTITY_VIEW',
        id,
        Number(page),
        Number(pageSize),
        sortProperty,
        sortOrder,
        startTime ? Number(startTime) : undefined,
        endTime ? Number(endTime) : undefined,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch entity view audit logs',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entity-views/:id/relations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get entity view relations' })
  async getEntityViewRelations(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('direction') direction?: 'FROM' | 'TO',
  ) {
    try {
      return await this.thingsboardApi.fetchEntityRelations(
        accessToken,
        'ENTITY_VIEW',
        id,
        direction || 'FROM',
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch entity view relations',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/entity-views/:id/relations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save a relation for an entity view' })
  async saveEntityViewRelation(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body()
    body: {
      relatedEntityId: string;
      relatedEntityType: string;
      relationType: string;
      direction: 'FROM' | 'TO';
    },
  ) {
    if (
      !body.relatedEntityId ||
      !body.relatedEntityType ||
      !body.relationType
    ) {
      throw new BadRequestException(
        'relatedEntityId, relatedEntityType and relationType are required',
      );
    }
    try {
      const relation =
        body.direction === 'FROM'
          ? {
            from: { id, entityType: 'ENTITY_VIEW' },
            to: {
              id: body.relatedEntityId,
              entityType: body.relatedEntityType,
            },
            type: body.relationType,
            typeGroup: 'COMMON',
          }
          : {
            from: {
              id: body.relatedEntityId,
              entityType: body.relatedEntityType,
            },
            to: { id, entityType: 'ENTITY_VIEW' },
            type: body.relationType,
            typeGroup: 'COMMON',
          };
      await this.thingsboardApi.saveRelation(accessToken, relation as any);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save entity view relation',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/entity-views/:id/relations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a relation for an entity view' })
  async deleteEntityViewRelation(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('relatedEntityId') relatedEntityId: string,
    @Query('relatedEntityType') relatedEntityType: string,
    @Query('relationType') relationType: string,
    @Query('direction') direction: 'FROM' | 'TO',
  ) {
    if (!relatedEntityId || !relatedEntityType || !relationType) {
      throw new BadRequestException(
        'relatedEntityId, relatedEntityType and relationType are required',
      );
    }
    try {
      if (direction === 'FROM') {
        await this.thingsboardApi.deleteRelation(
          accessToken,
          id,
          'ENTITY_VIEW',
          relationType,
          relatedEntityId,
          relatedEntityType,
        );
      } else {
        await this.thingsboardApi.deleteRelation(
          accessToken,
          relatedEntityId,
          relatedEntityType,
          relationType,
          id,
          'ENTITY_VIEW',
        );
      }
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete entity view relation',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/entity-views/:id/make-public')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Make entity view public (assign to public customer)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Entity view made public successfully',
    type: EntityViewResponseDto,
  })
  async makeEntityViewPublic(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.thingsboardApi.makeEntityViewPublic(accessToken, id);
    } catch (error) {
      if (
        error instanceof ThingsboardApiException &&
        (error.statusCode === HttpStatus.BAD_REQUEST ||
          error.statusCode === HttpStatus.NOT_FOUND)
      ) {
        return {
          success: true,
          info: true,
          message: error.message || 'Entity view is already public',
        };
      }

      throw new InternalServerErrorException(
        'Failed to make entity view public',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/entity-views/:id/make-private')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Make entity view private (unassign from customer)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Entity view made private successfully',
    type: EntityViewResponseDto,
  })
  async makeEntityViewPrivate(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.thingsboardApi.makeEntityViewPrivate(accessToken, id);
    } catch (error) {
      if (
        error instanceof ThingsboardApiException &&
        (error.statusCode === HttpStatus.BAD_REQUEST ||
          error.statusCode === HttpStatus.NOT_FOUND)
      ) {
        return {
          success: true,
          info: true,
          message: error.message || 'Entity view is already private',
        };
      }

      throw new InternalServerErrorException(
        'Failed to make entity view private',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/entity-views/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete entity view' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Entity view deleted successfully',
  })
  async deleteEntityView(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      await this.thingsboardApi.deleteEntityView(accessToken, id);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete entity view');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/assets/:id/make-public')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Make asset public (assign to public customer)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Asset made public successfully',
    type: AssetResponseDto,
  })
  async makeAssetPublic(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.thingsboardApi.makeAssetPublic(accessToken, id);
    } catch (error) {
      if (
        error instanceof ThingsboardApiException &&
        (error.statusCode === HttpStatus.BAD_REQUEST ||
          error.statusCode === HttpStatus.NOT_FOUND)
      ) {
        return {
          success: true,
          info: true,
          message: error.message || 'Asset is already public',
        };
      }
      throw new InternalServerErrorException('Failed to make asset public');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/assets/:id/make-private')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Make asset private (unassign from customer)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Asset made private successfully',
    type: AssetResponseDto,
  })
  async makeAssetPrivate(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.thingsboardApi.makeAssetPrivate(accessToken, id);
    } catch (error) {
      if (
        error instanceof ThingsboardApiException &&
        (error.statusCode === HttpStatus.BAD_REQUEST ||
          error.statusCode === HttpStatus.NOT_FOUND)
      ) {
        return {
          success: true,
          info: true,
          message: error.message || 'Asset is already private',
        };
      }
      throw new InternalServerErrorException('Failed to make asset private');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/assets/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete asset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Asset deleted successfully',
  })
  async deleteAsset(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      await this.thingsboardApi.deleteAsset(accessToken, id);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete asset');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/assets/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get asset by ID',
    description: 'Retrieve detailed information about a specific asset',
  })
  async getAsset(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.thingsboardApi.fetchAsset(accessToken, id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch asset');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Put('/assets/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update asset by ID',
    description: 'Update selected asset details in ThingsBoard',
  })
  async updateAsset(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
  ) {
    try {
      return await this.thingsboardApi.saveAsset(accessToken, {
        ...payload,
        id: {
          entityType: 'ASSET',
          id,
        },
      } as any);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update asset');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/assets/:id/attributes')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get asset server attributes',
    description: 'Retrieve server attributes for a specific asset',
  })
  async getAssetAttributes(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.thingsboardApi.fetchEntityAttributes(
        accessToken,
        'ASSET',
        id,
        'SERVER_SCOPE',
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch asset attributes',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/assets/:id/attributes')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update asset server attributes',
    description: 'Update server attributes for a specific asset',
  })
  async postAssetAttributes(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body() attributes: Record<string, any>,
  ) {
    try {
      await this.thingsboardApi.saveEntityAttributes(
        accessToken,
        'ASSET',
        id,
        'SERVER_SCOPE',
        attributes,
      );
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update asset attributes',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Put('/assets/:id/attributes')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update asset server attributes',
    description: 'Update server attributes for a specific asset',
  })
  async updateAssetAttributes(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body() attributes: Record<string, any>,
  ) {
    try {
      await this.thingsboardApi.saveEntityAttributes(
        accessToken,
        'ASSET',
        id,
        'SERVER_SCOPE',
        attributes,
      );
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update asset attributes',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/assets/:id/attributes/keys')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get asset attribute keys',
    description: 'Retrieve attribute keys for a specific asset',
  })
  async getAssetAttributeKeys(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.thingsboardApi.fetchEntityAttributeKeys(
        accessToken,
        'ASSET',
        id,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch asset attribute keys',
      );
    }
  }

  @Roles(Role.MODERATOR)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/assets/:id/telemetry/latest')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add latest asset telemetry',
    description: 'Push latest telemetry values for a specific asset',
  })
  async addAssetLatestTelemetry(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body() telemetry: Record<string, unknown>,
  ) {
    if (!telemetry || Object.keys(telemetry).length === 0) {
      throw new BadRequestException('Telemetry payload cannot be empty');
    }

    try {
      await this.thingsboardApi.addAssetLatestTelemetry(
        accessToken,
        id,
        telemetry,
      );
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to add latest asset telemetry',
      );
    }
  }

  @Roles(Role.MODERATOR)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/assets/:id/telemetry/latest')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get latest asset telemetry',
    description: 'Retrieve latest telemetry values for selected asset keys',
  })
  async getAssetLatestTelemetry(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('keys') keysParam: string,
  ) {
    const keys = (keysParam || '')
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);

    if (!keys.length) {
      throw new BadRequestException('Query parameter "keys" is required');
    }

    try {
      return await this.thingsboardApi.fetchAssetLatestTelemetry(
        accessToken,
        id,
        keys,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch latest asset telemetry',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/assets/:id/telemetry/latest/keys')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get latest asset telemetry keys',
    description: 'Retrieve all known latest telemetry keys for an asset',
  })
  async getAssetLatestTelemetryKeys(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.thingsboardApi.fetchAssetTelemetryKeys(accessToken, id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch asset telemetry keys',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/assets/:id/calculated-fields')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get calculated fields for asset',
    description: 'Retrieve paginated calculated fields for a specific asset',
  })
  async getAssetCalculatedFields(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    try {
      return await this.thingsboardApi.fetchAssetCalculatedFields(
        accessToken,
        id,
        Number(page),
        Number(pageSize),
        sortProperty,
        sortOrder,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch asset calculated fields',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/assets/:id/calculated-fields')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create calculated field for asset',
    description: 'Create a calculated field for a specific asset',
  })
  async createAssetCalculatedField(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body()
    payload: {
      title: string;
      fieldType: 'simple' | 'script';
      expression: string;
      outputKey?: string;
      outputType?: 'TIME_SERIES' | 'ATTRIBUTES';
      attributeScope?: 'SERVER_SCOPE' | 'SHARED_SCOPE';
      useLatestTimestamp?: boolean;
      arguments: Array<{
        argumentName: string;
        entityType:
        | 'current_entity'
        | 'device'
        | 'asset'
        | 'customer'
        | 'current_tenant';
        argumentType: 'attribute' | 'latest_telemetry';
        refEntityId?: string;
        timeSeriesKey?: string;
        name?: string;
        defaultValue?: string;
      }>;
      failuresEnabled?: boolean;
      allEnabled?: boolean;
      decimalsByDefault?: number;
      id?: { id: string; entityType: string };
    },
  ) {
    if (!payload?.title?.trim()) {
      throw new BadRequestException('Field title is required');
    }

    if (!Array.isArray(payload?.arguments) || payload.arguments.length === 0) {
      throw new BadRequestException('At least one argument is required');
    }

    if (!payload?.expression?.trim()) {
      throw new BadRequestException('Expression is required');
    }

    if (payload.fieldType === 'simple' && !payload?.outputKey?.trim()) {
      throw new BadRequestException('Output key is required for simple type');
    }

    const mappedArguments = payload.arguments.reduce<Record<string, unknown>>(
      (acc, argument) => {
        const argumentName = argument.argumentName?.trim();
        if (!argumentName) {
          return acc;
        }

        const refKey = argument.timeSeriesKey?.trim() || argument.name?.trim();

        if (!refKey) {
          return acc;
        }

        const entityTypeMap: Record<string, string> = {
          current_entity: 'CURRENT_ENTITY',
          device: 'DEVICE',
          asset: 'ASSET',
          customer: 'CUSTOMER',
          current_tenant: 'CURRENT_TENANT',
        };

        const typeMap: Record<string, string> = {
          latest_telemetry: 'TS_LATEST',
          attribute: 'ATTRIBUTE',
        };

        const mappedEntityType =
          entityTypeMap[argument.entityType] || 'CURRENT_ENTITY';

        acc[argumentName] = {
          refEntityKey: {
            type: typeMap[argument.argumentType] || 'TS_LATEST',
            key: refKey,
          },
          ...(argument.refEntityId?.trim()
            ? {
              refEntityId: {
                entityType: mappedEntityType,
                id: argument.refEntityId.trim(),
              },
            }
            : {}),
          defaultValue: argument.defaultValue ?? '',
        };

        return acc;
      },
      {},
    );

    if (Object.keys(mappedArguments).length === 0) {
      throw new BadRequestException('At least one valid argument is required');
    }

    const outputType =
      payload.outputType === 'ATTRIBUTES' ? 'ATTRIBUTES' : 'TIME_SERIES';

    try {
      return await this.thingsboardApi.createCalculatedField(accessToken, {
        entityId: { entityType: 'ASSET', id },
        ...(payload.id ? { id: payload.id } : {}),
        configuration: {
          arguments: mappedArguments,
          useLatestTs: payload.useLatestTimestamp ?? false,
          type: payload.fieldType?.toUpperCase() || 'SIMPLE',
          expression: payload.expression.trim(),
          output: {
            name:
              payload.outputKey?.trim() ||
              payload.title?.trim() ||
              payload.expression.trim(),
            type: outputType,
            ...(outputType === 'ATTRIBUTES'
              ? {
                scope:
                  payload.attributeScope === 'SHARED_SCOPE'
                    ? 'SHARED_SCOPE'
                    : 'SERVER_SCOPE',
              }
              : {}),
            decimalsByDefault: payload.decimalsByDefault ?? 2,
          },
        },
        name: payload.title.trim(),
        type: payload.fieldType?.toUpperCase() || 'SIMPLE',
        debugSettings: {
          failuresEnabled: payload.failuresEnabled ?? true,
          allEnabled: payload.allEnabled ?? true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create asset calculated field',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/assets/:id/alarms')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get asset alarms' })
  async getAssetAlarms(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('statusList') statusList?: string,
    @Query('severityList') severityList?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    try {
      return await this.thingsboardApi.fetchEntityAlarms(
        accessToken,
        'ASSET',
        id,
        Number(page),
        Number(pageSize),
        statusList
          ?.split(',')
          .map((it) => it.trim())
          .filter(Boolean),
        severityList
          ?.split(',')
          .map((it) => it.trim())
          .filter(Boolean),
        startTime ? Number(startTime) : undefined,
        endTime ? Number(endTime) : undefined,
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch asset alarms');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/assets/:id/events')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get asset events' })
  async getAssetEvents(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('eventType') eventType?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    try {
      return await this.thingsboardApi.fetchEntityEvents(
        accessToken,
        'ASSET',
        id,
        Number(page),
        Number(pageSize),
        eventType,
        startTime ? Number(startTime) : undefined,
        endTime ? Number(endTime) : undefined,
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch asset events');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/assets/:id/audit-logs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get asset audit logs' })
  async getAssetAuditLogs(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    try {
      return await this.thingsboardApi.fetchEntityAuditLogs(
        accessToken,
        'ASSET',
        id,
        Number(page),
        Number(pageSize),
        sortProperty,
        sortOrder,
        startTime ? Number(startTime) : undefined,
        endTime ? Number(endTime) : undefined,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch asset audit logs',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/assets/:id/relations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get asset relations' })
  async getAssetRelations(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('direction') direction?: 'FROM' | 'TO',
  ) {
    try {
      return await this.thingsboardApi.fetchEntityRelations(
        accessToken,
        'ASSET',
        id,
        direction || 'FROM',
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch asset relations');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/assets/:id/relations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save a relation for an asset' })
  async saveAssetRelation(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body()
    body: {
      relatedEntityId: string;
      relatedEntityType: string;
      relationType: string;
      direction: 'FROM' | 'TO';
    },
  ) {
    if (
      !body.relatedEntityId ||
      !body.relatedEntityType ||
      !body.relationType
    ) {
      throw new BadRequestException(
        'relatedEntityId, relatedEntityType and relationType are required',
      );
    }
    try {
      const relation =
        body.direction === 'FROM'
          ? {
            from: { id, entityType: 'ASSET' },
            to: {
              id: body.relatedEntityId,
              entityType: body.relatedEntityType,
            },
            type: body.relationType,
            typeGroup: 'COMMON',
          }
          : {
            from: {
              id: body.relatedEntityId,
              entityType: body.relatedEntityType,
            },
            to: { id, entityType: 'ASSET' },
            type: body.relationType,
            typeGroup: 'COMMON',
          };
      await this.thingsboardApi.saveRelation(accessToken, relation as any);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Failed to save asset relation');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/assets/:id/relations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a relation for an asset' })
  async deleteAssetRelation(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('relatedEntityId') relatedEntityId: string,
    @Query('relatedEntityType') relatedEntityType: string,
    @Query('relationType') relationType: string,
    @Query('direction') direction: 'FROM' | 'TO',
  ) {
    if (!relatedEntityId || !relatedEntityType || !relationType) {
      throw new BadRequestException(
        'relatedEntityId, relatedEntityType and relationType are required',
      );
    }
    try {
      if (direction === 'FROM') {
        await this.thingsboardApi.deleteRelation(
          accessToken,
          id,
          'ASSET',
          relationType,
          relatedEntityId,
          relatedEntityType,
        );
      } else {
        await this.thingsboardApi.deleteRelation(
          accessToken,
          relatedEntityId,
          relatedEntityType,
          relationType,
          id,
          'ASSET',
        );
      }
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete asset relation');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/devices/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get device by ID',
    description: 'Retrieve detailed information about a specific device',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device details retrieved successfully',
    type: DeviceDetails,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Device not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch device from ThingsBoard',
  })
  async getDevice(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    const query = new FetchDeviceByIdQuery({ accessToken, id });
    const result: Result<DeviceDetails, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (deviceDetails: DeviceDetails) => deviceDetails,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Put('/devices/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update device by ID',
    description: 'Update selected device details in ThingsBoard',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device updated successfully',
    type: DeviceDetails,
  })
  async updateDevice(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
  ) {
    try {
      return await this.thingsboardApi.saveDevice(accessToken, {
        ...payload,
        id: {
          entityType: 'DEVICE',
          id,
        },
      } as any);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update device');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/device-profile-infos')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get device profile infos',
    description: 'Retrieve paginated device profile infos from ThingsBoard',
  })
  async getDeviceProfileInfosWithTextSearch(
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 100,
    @Query('sortProperty') sortProperty = 'name',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('textSearch') textSearch?: string,
  ) {
    try {
      return await this.thingsboardApi.fetchDeviceProfileInfosWithTextSearch(
        accessToken,
        Number(page),
        Number(pageSize),
        sortProperty,
        sortOrder,
        textSearch,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch device profile infos',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/ota-packages')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get OTA packages',
    description:
      'Retrieve paginated OTA packages for selected type and device profile',
  })
  async getOtaPackagesWithTextSearch(
    @TbAccessToken() accessToken: string,
    @Query('type') type: 'FIRMWARE' | 'SOFTWARE',
    @Query('deviceProfileId') deviceProfileId: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 100,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('textSearch') textSearch?: string,
  ) {
    if (!type) {
      throw new BadRequestException('Query parameter "type" is required');
    }

    if (!deviceProfileId) {
      throw new BadRequestException(
        'Query parameter "deviceProfileId" is required',
      );
    }

    try {
      return await this.thingsboardApi.fetchOtaPackagesWithTextSearch(
        accessToken,
        type,
        deviceProfileId,
        Number(page),
        Number(pageSize),
        sortProperty,
        sortOrder,
        textSearch,
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch OTA packages');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/asset-profiles')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get asset profiles',
    description: 'Retrieve paginated list of full asset profiles',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Asset profiles retrieved successfully',
    type: AssetProfilesResponseDto,
  })
  async getAssetProfiles(
    @TbAccessToken() accessToken: string,
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('textSearch') textSearch?: string,
  ) {
    const query = new FetchAssetProfilesQuery({
      accessToken,
      page: page ? parseInt(page, 10) : 0,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      sortProperty: sortProperty || 'createdTime',
      sortOrder: (sortOrder as 'ASC' | 'DESC') || 'DESC',
      textSearch,
    });
    const result: Result<AssetProfilesResponse, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: AssetProfilesResponse) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/asset-profiles/:id/export')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Export asset profile',
    description: 'Export single asset profile with optional inline images',
  })
  async exportAssetProfile(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('inlineImages') inlineImages = 'true',
  ) {
    return this.thingsboardApi.getAssetProfile(
      id,
      accessToken,
      inlineImages === 'true',
    );
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/asset-profiles/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get asset profile details',
    description: 'Retrieve full details for a single asset profile',
  })
  async getAssetProfileById(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    return this.thingsboardApi.getAssetProfile(id, accessToken, false);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/asset-profiles/:id/attributes/keys')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get asset profile attribute keys',
    description:
      'Retrieve attribute keys for a specific asset profile by scope using entitiesQuery/find/keys',
  })
  async getAssetProfileAttributeKeys(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('scope') scopeParam?: string,
  ) {
    const scope = (scopeParam || 'SERVER_SCOPE').toUpperCase() as any;

    if (
      scope !== 'SERVER_SCOPE' &&
      scope !== 'CLIENT_SCOPE' &&
      scope !== 'SHARED_SCOPE'
    ) {
      throw new BadRequestException('Invalid scope value');
    }

    const profile = await this.thingsboardApi.getAssetProfile(
      id,
      accessToken,
      false,
    );
    const assetType = profile?.name?.trim();

    if (!assetType) {
      return [];
    }

    return this.thingsboardApi.fetchAttributeKeysByAssetTypeAndScope(
      accessToken,
      assetType,
      scope,
    );
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/asset-profiles/:id/telemetry/latest/keys')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get asset profile latest telemetry keys',
    description:
      'Retrieve all known latest telemetry keys for an asset profile',
  })
  async getAssetProfileLatestTelemetryKeys(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    const profile = await this.thingsboardApi.getAssetProfile(
      id,
      accessToken,
      false,
    );
    const assetType = profile?.name?.trim();

    if (!assetType) {
      return [];
    }

    return this.thingsboardApi.fetchTimeseriesKeysByAssetType(
      accessToken,
      assetType,
    );
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/asset-profiles/:id/calculated-fields')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get calculated fields for asset profile',
    description:
      'Retrieve paginated calculated fields for a specific asset profile',
  })
  async getAssetProfileCalculatedFields(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    return this.thingsboardApi.fetchAssetProfileCalculatedFields(
      accessToken,
      id,
      Number(page),
      Number(pageSize),
      sortProperty,
      sortOrder,
    );
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/asset-profiles/:id/calculated-fields')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create calculated field for asset profile',
    description:
      'Create a calculated field using ThingsBoard calculatedField API for an asset profile',
  })
  async createAssetProfileCalculatedField(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body()
    payload: {
      title: string;
      fieldType: 'simple' | 'script';
      expression: string;
      outputKey?: string;
      outputType?: 'TIME_SERIES' | 'ATTRIBUTES';
      attributeScope?: 'SERVER_SCOPE' | 'SHARED_SCOPE';
      useLatestTimestamp?: boolean;
      arguments: Array<{
        argumentName: string;
        entityType:
        | 'current_entity'
        | 'device'
        | 'asset'
        | 'customer'
        | 'current_tenant';
        argumentType: 'attribute' | 'latest_telemetry';
        refEntityId?: string;
        timeSeriesKey?: string;
        name?: string;
        defaultValue?: string;
      }>;
      failuresEnabled?: boolean;
      allEnabled?: boolean;
      decimalsByDefault?: number;
      id?: { id: string; entityType: string };
    },
  ) {
    if (!payload?.title?.trim()) {
      throw new BadRequestException('Field title is required');
    }

    if (!Array.isArray(payload?.arguments) || payload.arguments.length === 0) {
      throw new BadRequestException('At least one argument is required');
    }

    if (!payload?.expression?.trim()) {
      throw new BadRequestException('Expression is required');
    }

    if (payload.fieldType === 'simple' && !payload?.outputKey?.trim()) {
      throw new BadRequestException('Output key is required for simple type');
    }

    const mappedArguments = payload.arguments.reduce<Record<string, unknown>>(
      (acc, argument) => {
        const argumentName = argument.argumentName?.trim();
        if (!argumentName) {
          return acc;
        }

        const refKey = argument.timeSeriesKey?.trim() || argument.name?.trim();

        if (!refKey) {
          return acc;
        }

        const entityTypeMap: Record<string, string> = {
          current_entity: 'CURRENT_ENTITY',
          device: 'DEVICE',
          asset: 'ASSET',
          customer: 'CUSTOMER',
          current_tenant: 'CURRENT_TENANT',
        };

        const typeMap: Record<string, string> = {
          latest_telemetry: 'TS_LATEST',
          attribute: 'ATTRIBUTE',
        };

        const mappedEntityType =
          entityTypeMap[argument.entityType] || 'CURRENT_ENTITY';

        acc[argumentName] = {
          refEntityKey: {
            type: typeMap[argument.argumentType] || 'TS_LATEST',
            key: refKey,
          },
          ...(argument.refEntityId?.trim()
            ? {
              refEntityId: {
                entityType: mappedEntityType,
                id: argument.refEntityId.trim(),
              },
            }
            : {}),
          defaultValue: argument.defaultValue ?? '',
        };

        return acc;
      },
      {},
    );

    if (Object.keys(mappedArguments).length === 0) {
      throw new BadRequestException('At least one valid argument is required');
    }

    const outputType =
      payload.outputType === 'ATTRIBUTES' ? 'ATTRIBUTES' : 'TIME_SERIES';

    try {
      return await this.thingsboardApi.createCalculatedField(accessToken, {
        entityId: { entityType: 'ASSET_PROFILE', id },
        ...(payload.id ? { id: payload.id } : {}),
        configuration: {
          arguments: mappedArguments,
          useLatestTs: payload.useLatestTimestamp ?? false,
          type: payload.fieldType?.toUpperCase() || 'SIMPLE',
          expression: payload.expression.trim(),
          output: {
            name:
              payload.outputKey?.trim() ||
              payload.title?.trim() ||
              payload.expression.trim(),
            type: outputType,
            ...(outputType === 'ATTRIBUTES'
              ? {
                scope:
                  payload.attributeScope === 'SHARED_SCOPE'
                    ? 'SHARED_SCOPE'
                    : 'SERVER_SCOPE',
              }
              : {}),
            decimalsByDefault: payload.decimalsByDefault ?? 2,
          },
        },
        name: payload.title.trim(),
        type: payload.fieldType?.toUpperCase() || 'SIMPLE',
        debugSettings: {
          failuresEnabled: payload.failuresEnabled ?? true,
          allEnabled: payload.allEnabled ?? true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create asset profile calculated field',
      );
    }
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/calculated-field/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete calculated field',
    description: 'Delete a calculated field by its ID',
  })
  async deleteCalculatedField(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      await this.thingsboardApi.deleteCalculatedField(accessToken, id);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete calculated field',
      );
    }
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/asset-profiles/:id/audit-logs')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get asset profile audit logs',
    description: 'Retrieve paginated audit logs for a specific asset profile',
  })
  async getAssetProfileAuditLogs(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    return this.thingsboardApi.fetchEntityAuditLogs(
      accessToken,
      'ASSET_PROFILE',
      id,
      Number(page),
      Number(pageSize),
      sortProperty,
      sortOrder,
      startTime ? Number(startTime) : undefined,
      endTime ? Number(endTime) : undefined,
    );
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/asset-profiles')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create or update asset profile',
    description: 'Save asset profile using ThingsBoard assetProfile API',
  })
  async saveAssetProfile(
    @TbAccessToken() accessToken: string,
    @Body() payload: any,
  ) {
    return this.thingsboardApi.saveAssetProfile(accessToken, payload);
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/asset-profiles/:id/default')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Make asset profile default',
    description: 'Set selected asset profile as default profile',
  })
  async makeAssetProfileDefault(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    await this.thingsboardApi.makeAssetProfileDefault(accessToken, id);
    return { success: true };
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/asset-profiles/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete asset profile',
    description: 'Delete selected asset profile',
  })
  async deleteAssetProfile(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    await this.thingsboardApi.deleteAssetProfile(accessToken, id);
    return { success: true };
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/asset-profile-info/:name')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get asset profile info by name',
    description: 'Retrieve a single asset profile info by profile name',
  })
  async getAssetProfileInfoByName(
    @TbAccessToken() accessToken: string,
    @Param('name') name: string,
  ): Promise<AssetProfileInfo> {
    if (!name?.trim()) {
      throw new BadRequestException('Path parameter "name" is required');
    }

    try {
      return await this.thingsboardApi.fetchAssetProfileInfo(accessToken, name);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch asset profile info',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/asset-profile-infos')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get asset profile infos',
    description: 'Retrieve paginated asset profile infos from ThingsBoard',
  })
  async getAssetProfileInfos(
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'name',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('textSearch') textSearch?: string,
  ): Promise<AssetProfileInfosResponse> {
    try {
      return await this.thingsboardApi.fetchAssetProfileInfos(
        accessToken,
        Number(page),
        Number(pageSize),
        sortProperty,
        sortOrder,
        textSearch,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch asset profile infos',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/customers')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get customers',
    description: 'Retrieve paginated customers from ThingsBoard',
  })
  async getCustomers(
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 50,
    @Query('sortProperty') sortProperty = 'title',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('textSearch') textSearch?: string,
  ): Promise<CustomersResponse> {
    try {
      return await this.thingsboardApi.fetchCustomers(
        accessToken,
        Number(page),
        Number(pageSize),
        sortProperty,
        sortOrder,
        textSearch,
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch customers');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/customers/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get customer details',
    description: 'Retrieve customer details from ThingsBoard',
  })
  async getCustomer(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ): Promise<CustomerDetails> {
    try {
      return await this.thingsboardApi.fetchCustomer(accessToken, id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch customer details',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/customers/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete customer',
    description: 'Delete a customer in ThingsBoard by id',
  })
  async deleteCustomer(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      await this.thingsboardApi.deleteCustomer(accessToken, id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete customer');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/customers/:id/attributes')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer server attributes' })
  async getCustomerAttributes(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.thingsboardApi.fetchEntityAttributes(
        accessToken,
        'CUSTOMER',
        id,
        'SERVER_SCOPE',
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch customer attributes',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/customers/:id/attributes')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save customer server attributes' })
  async postCustomerAttributes(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body() attributes: Record<string, any>,
  ) {
    try {
      await this.thingsboardApi.saveEntityAttributes(
        accessToken,
        'CUSTOMER',
        id,
        'SERVER_SCOPE',
        attributes,
      );
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save customer attributes',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/customers/:id/telemetry/latest/keys')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer latest telemetry keys' })
  async getCustomerLatestTelemetryKeys(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.thingsboardApi.fetchCustomerTelemetryKeys(
        accessToken,
        id,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch customer telemetry keys',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/customers/:id/telemetry/latest')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer latest telemetry' })
  async getCustomerLatestTelemetry(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('keys') keysParam: string,
  ) {
    const keys = (keysParam || '')
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);

    if (!keys.length) {
      throw new BadRequestException('Query parameter "keys" is required');
    }

    try {
      return await this.thingsboardApi.fetchCustomerLatestTelemetry(
        accessToken,
        id,
        keys,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch customer latest telemetry',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/customers/:id/telemetry/latest')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add customer latest telemetry' })
  async addCustomerLatestTelemetry(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body() telemetry: Record<string, unknown>,
  ) {
    if (!telemetry || Object.keys(telemetry).length === 0) {
      throw new BadRequestException('Telemetry payload cannot be empty');
    }

    try {
      await this.thingsboardApi.addCustomerLatestTelemetry(
        accessToken,
        id,
        telemetry,
      );
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to add customer latest telemetry',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/customers/:id/alarms')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer alarms' })
  async getCustomerAlarms(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('statusList') statusList?: string,
    @Query('severityList') severityList?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    try {
      return await this.thingsboardApi.fetchEntityAlarms(
        accessToken,
        'CUSTOMER',
        id,
        Number(page),
        Number(pageSize),
        statusList
          ?.split(',')
          .map((it) => it.trim())
          .filter(Boolean),
        severityList
          ?.split(',')
          .map((it) => it.trim())
          .filter(Boolean),
        startTime ? Number(startTime) : undefined,
        endTime ? Number(endTime) : undefined,
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch customer alarms');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/devices')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new device',
    description:
      'Create a new device in ThingsBoard with the specified configuration (and pre defined telemetry_keys)',
  })
  @ApiBody({ type: CreateDeviceRequest })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Device created successfully',
    type: Device,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload or device name already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create device in ThingsBoard',
  })
  async createDevice(
    @TbAccessToken() accessToken: string,
    @Body() payload: CreateDeviceRequest,
    @ActiveUser() user: CurrentUser,
  ) {
    const command = new CreateDeviceCommand({
      accessToken,
      payload,
      userId: user.id,
    });
    const result: Result<Device, CreateDeviceErrors> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (device: Device) => device,
      Err: (error: CreateDeviceErrors) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/devices/:id/attributes')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get device shared attributes',
    description: 'Retrieve shared attributes for a specific device',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device attributes retrieved successfully',
    schema: {
      type: 'array',
      example: [
        {
          lastUpdateTs: 1609459200000,
          key: 'telemetry_keys',
          value: ['temperature', 'humidity'],
        },
        {
          lastUpdateTs: 1609459200000,
          key: 'limits',
          value: {
            temperature: { minimum: 0, maximum: 100 },
            humidity: { minimum: 20 },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Device not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch device attributes from ThingsBoard',
  })
  async getDeviceAttributes(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('scope') scopeParam?: string,
  ) {
    const scope = (scopeParam || 'SHARED_SCOPE').toUpperCase() as any;

    if (
      scope !== 'SERVER_SCOPE' &&
      scope !== 'CLIENT_SCOPE' &&
      scope !== 'SHARED_SCOPE'
    ) {
      throw new BadRequestException('Invalid scope value');
    }

    try {
      return await this.thingsboardApi.fetchEntityAttributes(
        accessToken,
        'DEVICE',
        id,
        scope,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch device attributes',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/devices/:id/attributes/keys')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get device attribute keys',
    description: 'Retrieve attribute keys for a specific device',
  })
  async getDeviceAttributeKeys(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.thingsboardApi.fetchEntityAttributeKeys(
        accessToken,
        'DEVICE',
        id,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch device attribute keys',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Put('/devices/:id/attributes')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update device shared attributes',
    description: 'Update shared attributes for a specific device',
  })
  @ApiBody({
    schema: {
      type: 'object',
      description: 'Attributes to update (key-value pairs)',
      example: {
        limits: {
          temperature: {
            maximum: 37,
          },
          respiratory_rate: {
            minimum: 88,
          },
        },
        telemetry_keys: ['temperature', 'respiratory_rate'],
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attributes updated successfully',
    schema: {
      type: 'object',
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Device not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to update device attributes in ThingsBoard',
  })
  async updateDeviceAttributes(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body() attributes: Record<string, any>,
    @Query('scope') scopeParam?: string,
  ) {
    const scope = (scopeParam || 'SHARED_SCOPE').toUpperCase() as any;

    if (scope !== 'SERVER_SCOPE' && scope !== 'SHARED_SCOPE') {
      throw new BadRequestException(
        'Only SERVER_SCOPE and SHARED_SCOPE are allowed for updates',
      );
    }

    try {
      await this.thingsboardApi.saveEntityAttributes(
        accessToken,
        'DEVICE',
        id,
        scope,
        attributes,
      );

      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update device attributes',
      );
    }
  }

  @Roles(Role.MODERATOR)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/devices/:id/telemetry/latest')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add latest telemetry',
    description: 'Push latest telemetry values for a specific device',
  })
  @ApiBody({
    schema: {
      type: 'object',
      description: 'Telemetry key-value payload',
      example: {
        heart_rate: 82,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Latest telemetry added successfully',
    schema: {
      type: 'object',
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid telemetry payload',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to add latest telemetry in ThingsBoard',
  })
  async addLatestTelemetry(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body() telemetry: Record<string, unknown>,
  ) {
    if (!telemetry || Object.keys(telemetry).length === 0) {
      throw new BadRequestException('Telemetry payload cannot be empty');
    }

    const command = new AddDeviceLatestTelemetryCommand(
      accessToken,
      id,
      telemetry,
    );

    const result: Result<void, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: () => ({ success: true }),
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/devices/:id/telemetry/latest')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get latest telemetry',
    description: 'Retrieve latest telemetry values for selected keys',
  })
  @ApiQuery({
    name: 'keys',
    required: true,
    description: 'Comma-separated telemetry keys, e.g. heart_rate,spo2',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Latest telemetry retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid keys query parameter',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch latest telemetry from ThingsBoard',
  })
  async getLatestTelemetry(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('keys') keysParam: string,
  ) {
    const keys = (keysParam || '')
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);

    if (!keys.length) {
      throw new BadRequestException('Query parameter "keys" is required');
    }

    const query = new FetchDeviceLatestTelemetryQuery(accessToken, id, keys);
    const result: Result<
      Record<string, Array<{ ts: number; value: unknown }>>,
      ThingsboardApiException
    > = await this.queryBus.execute(query);

    return match(result, {
      Ok: (telemetry) => telemetry,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/devices/:id/telemetry/latest/keys')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get latest telemetry keys',
    description: 'Retrieve all known latest telemetry keys for a device',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Telemetry keys retrieved successfully',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['heart_rate', 'spo2', 'temperature'],
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch telemetry keys from ThingsBoard',
  })
  async getLatestTelemetryKeys(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    const query = new FetchDeviceTelemetryKeysQuery(accessToken, id);
    const result: Result<string[], ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (keys) => keys,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/devices/:id/calculated-fields')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get calculated fields for device',
    description: 'Retrieve paginated calculated fields for a specific device',
  })
  async getDeviceCalculatedFields(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const query = new FetchDeviceCalculatedFieldsQuery(
      accessToken,
      id,
      Number(page),
      Number(pageSize),
      sortProperty,
      sortOrder,
    );

    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/devices/:id/calculated-fields')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create calculated field for device',
    description:
      'Create a calculated field using ThingsBoard calculatedField API',
  })
  async createDeviceCalculatedField(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body()
    payload: {
      title: string;
      fieldType: 'simple' | 'script';
      expression: string;
      outputKey?: string;
      outputType?: 'TIME_SERIES' | 'ATTRIBUTES';
      attributeScope?: 'SERVER_SCOPE' | 'SHARED_SCOPE';
      useLatestTimestamp?: boolean;
      arguments: Array<{
        argumentName: string;
        entityType:
        | 'current_entity'
        | 'device'
        | 'asset'
        | 'customer'
        | 'current_tenant';
        argumentType: 'attribute' | 'latest_telemetry';
        refEntityId?: string;
        timeSeriesKey?: string;
        name?: string;
        defaultValue?: string;
      }>;
      failuresEnabled?: boolean;
      allEnabled?: boolean;
      decimalsByDefault?: number;
      id?: { id: string; entityType: string };
    },
  ) {
    if (!payload?.title?.trim()) {
      throw new BadRequestException('Field title is required');
    }

    if (!Array.isArray(payload?.arguments) || payload.arguments.length === 0) {
      throw new BadRequestException('At least one argument is required');
    }

    if (!payload?.expression?.trim()) {
      throw new BadRequestException('Expression is required');
    }

    if (payload.fieldType === 'simple' && !payload?.outputKey?.trim()) {
      throw new BadRequestException('Output key is required for simple type');
    }

    const mappedArguments = payload.arguments.reduce<Record<string, unknown>>(
      (acc, argument) => {
        const argumentName = argument.argumentName?.trim();
        if (!argumentName) {
          return acc;
        }

        const refKey = argument.timeSeriesKey?.trim() || argument.name?.trim();

        if (!refKey) {
          return acc;
        }

        const entityTypeMap: Record<string, string> = {
          current_entity: 'CURRENT_ENTITY',
          device: 'DEVICE',
          asset: 'ASSET',
          customer: 'CUSTOMER',
          current_tenant: 'CURRENT_TENANT',
        };

        const typeMap: Record<string, string> = {
          latest_telemetry: 'TS_LATEST',
          attribute: 'ATTRIBUTE',
        };

        const mappedEntityType =
          entityTypeMap[argument.entityType] || 'CURRENT_ENTITY';

        acc[argumentName] = {
          refEntityKey: {
            type: typeMap[argument.argumentType] || 'TS_LATEST',
            key: refKey,
          },
          ...(argument.refEntityId?.trim()
            ? {
              refEntityId: {
                entityType: mappedEntityType,
                id: argument.refEntityId.trim(),
              },
            }
            : {}),
          defaultValue: argument.defaultValue ?? '',
        };

        return acc;
      },
      {},
    );

    const outputType =
      payload.outputType === 'ATTRIBUTES' ? 'ATTRIBUTES' : 'TIME_SERIES';
    const outputName =
      payload.outputKey?.trim() ||
      payload.title?.trim() ||
      payload.expression.trim();

    if (Object.keys(mappedArguments).length === 0) {
      throw new BadRequestException('At least one valid argument is required');
    }

    const command = new CreateDeviceCalculatedFieldCommand(accessToken, {
      entityId: { entityType: 'DEVICE', id },
      ...(payload.id ? { id: payload.id } : {}),
      configuration: {
        arguments: mappedArguments,
        useLatestTs: payload.useLatestTimestamp ?? false,
        type: payload.fieldType?.toUpperCase() || 'SIMPLE',
        expression: payload.expression.trim(),
        output: {
          name: outputName,
          type: outputType,
          ...(outputType === 'ATTRIBUTES'
            ? {
              scope:
                payload.attributeScope === 'SHARED_SCOPE'
                  ? 'SHARED_SCOPE'
                  : 'SERVER_SCOPE',
            }
            : {}),
          decimalsByDefault: payload.decimalsByDefault ?? 2,
        },
      },
      name: payload.title.trim(),
      type: payload.fieldType?.toUpperCase() || 'SIMPLE',
      debugSettings: {
        failuresEnabled: payload.failuresEnabled ?? true,
        allEnabled: payload.allEnabled ?? true,
      },
    });

    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (created) => created,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/devices/:id/audit-logs')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get device audit logs',
    description: 'Retrieve paginated audit logs for a specific device',
  })
  async getDeviceAuditLogs(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const start = startTime ? parseInt(startTime, 10) : undefined;
    const end = endTime ? parseInt(endTime, 10) : undefined;

    const query = new FetchDeviceAuditLogsQuery(
      id,
      Number(page),
      Number(pageSize),
      sortProperty,
      sortOrder,
      start,
      end,
      accessToken,
    );

    const result: Result<EntityAuditLogsResponse, Error> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: EntityAuditLogsResponse) => response,
      Err: (error: Error) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/devices/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete device' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device deleted successfully',
  })
  async deleteDevice(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      await this.thingsboardApi.deleteDevice(accessToken, id);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete device');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/devices/:id/relations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get device relations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device relations retrieved successfully',
  })
  async getDeviceRelations(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('direction') direction?: 'FROM' | 'TO',
  ) {
    const query = new FetchDeviceRelationsQuery(
      id,
      direction || 'FROM',
      accessToken,
    );
    const result: Result<any, Error> = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response) => response,
      Err: (error: Error) => {
        throw new InternalServerErrorException(error.message);
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/devices/:id/relations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save a relation for a device' })
  async saveDeviceRelation(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body()
    body: {
      relatedEntityId: string;
      relatedEntityType: string;
      relationType: string;
      direction: 'FROM' | 'TO';
    },
  ) {
    if (
      !body.relatedEntityId ||
      !body.relatedEntityType ||
      !body.relationType
    ) {
      throw new BadRequestException(
        'relatedEntityId, relatedEntityType and relationType are required',
      );
    }
    try {
      const relation =
        body.direction === 'FROM'
          ? {
            from: { id, entityType: 'DEVICE' },
            to: {
              id: body.relatedEntityId,
              entityType: body.relatedEntityType,
            },
            type: body.relationType,
            typeGroup: 'COMMON',
          }
          : {
            from: {
              id: body.relatedEntityId,
              entityType: body.relatedEntityType,
            },
            to: { id, entityType: 'DEVICE' },
            type: body.relationType,
            typeGroup: 'COMMON',
          };
      await this.thingsboardApi.saveRelation(accessToken, relation as any);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Failed to save device relation');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/devices/:id/relations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a relation for a device' })
  async deleteDeviceRelation(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('relatedEntityId') relatedEntityId: string,
    @Query('relatedEntityType') relatedEntityType: string,
    @Query('relationType') relationType: string,
    @Query('direction') direction: 'FROM' | 'TO',
  ) {
    if (!relatedEntityId || !relatedEntityType || !relationType) {
      throw new BadRequestException(
        'relatedEntityId, relatedEntityType and relationType are required',
      );
    }
    try {
      if (direction === 'FROM') {
        await this.thingsboardApi.deleteRelation(
          accessToken,
          id,
          'DEVICE',
          relationType,
          relatedEntityId,
          relatedEntityType,
        );
      } else {
        await this.thingsboardApi.deleteRelation(
          accessToken,
          relatedEntityId,
          relatedEntityType,
          relationType,
          id,
          'DEVICE',
        );
      }
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete device relation',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/devices/:id/make-public')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Make device public (assign to public customer)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device made public successfully',
  })
  async makeDevicePublic(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      const result = await this.thingsboardApi.makeDevicePublic(
        accessToken,
        id,
      );
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Failed to make device public');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/devices/:id/make-private')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Make device private (unassign from customer)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device made private successfully',
  })
  async makeDevicePrivate(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      const result = await this.thingsboardApi.makeDevicePrivate(
        accessToken,
        id,
      );
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Failed to make device private');
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/devices/:id/credentials')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get device credentials' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device credentials retrieved successfully',
  })
  async getDeviceCredentials(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.thingsboardApi.getDeviceCredentials(accessToken, id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to get device credentials',
      );
    }
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/devices/credentials')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save device credentials' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device credentials saved successfully',
  })
  async saveDeviceCredentials(
    @TbAccessToken() accessToken: string,
    @Body() credentials: any,
  ) {
    try {
      return await this.thingsboardApi.saveDeviceCredentials(
        accessToken,
        credentials,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save device credentials',
      );
    }
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/admin/securitySettings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get security settings',
    description: 'Retrieve current security settings configuration',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Security settings retrieved successfully',
    type: SecuritySettingsDtoResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch security settings',
  })
  async getSecuritySettings(@TbAccessToken() accessToken: string) {
    const query = new FetchSecuritySettingsQuery(accessToken);
    const result: Result<SecuritySettingsDtoResponse, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (securityResponse: SecuritySettingsDtoResponse) => securityResponse,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/admin/securitySettings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update security settings',
    description: 'Update security policies configuration for tenants',
  })
  @ApiBody({
    type: SecuritySettingsDto,
    description: 'Security settings to update',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Security settings updated successfully',
    type: SecuritySettingsDtoResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to update security settings',
  })
  async updateSecuritySettings(
    @Body() settings: SecuritySettingsDto,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new UpdateSecuritySettingsCommand(settings, accessToken);
    const result: Result<SecuritySettingsDtoResponse, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (securityResponse: SecuritySettingsDtoResponse) => securityResponse,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/admin/updates')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current and newest version',
    description:
      'Get current and newest version of thingsboard - get updates info',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Security settings updated successfully',
    type: DashboardVersionResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  async getCurrentVersion(@TbAccessToken() accessToken: string) {
    const query = new FetchVersionQuery(accessToken);
    const result: Result<DashboardVersionResponse, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (result: DashboardVersionResponse) => result,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/admin/settings/general')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get general settings',
    description: 'Retrieve general settings including base URL configuration',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'General settings retrieved successfully',
    type: GeneralSettingsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch general settings',
  })
  async getGeneralSettings(@TbAccessToken() accessToken: string) {
    const query = new FetchGeneralSettingsQuery(accessToken);
    const result: Result<GeneralSettingsDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (settings: GeneralSettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/admin/settings/general')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update general settings',
    description: 'Update general settings including base URL configuration',
  })
  @ApiBody({
    type: GeneralSettingsRequestDto,
    description: 'General settings to update',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'General settings updated successfully',
    type: GeneralSettingsDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to update general settings',
  })
  async updateGeneralSettings(
    @Body() settings: GeneralSettingsRequestDto,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new UpdateGeneralSettingsCommand(settings, accessToken);
    const result: Result<GeneralSettingsDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (settings: GeneralSettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/admin/settings/connectivity')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get connectivity settings',
    description: 'Retrieve device connectivity settings for all protocols',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connectivity settings retrieved successfully',
    type: ConnectivitySettingsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch connectivity settings',
  })
  async getConnectivitySettings(@TbAccessToken() accessToken: string) {
    const query = new FetchConnectivitySettingsQuery(accessToken);
    const result: Result<ConnectivitySettingsDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (settings: ConnectivitySettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/admin/settings/connectivity')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update connectivity settings',
    description: 'Update device connectivity settings for all protocols',
  })
  @ApiBody({
    type: ConnectivitySettingsRequestDto,
    description: 'Connectivity settings to update',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connectivity settings updated successfully',
    type: ConnectivitySettingsDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to update connectivity settings',
  })
  async updateConnectivitySettings(
    @Body() settings: ConnectivitySettingsRequestDto,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new UpdateConnectivitySettingsCommand(
      settings,
      accessToken,
    );
    const result: Result<ConnectivitySettingsDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (settings: ConnectivitySettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/admin/settings/sms')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get SMS settings',
    description: 'Retrieve SMS provider settings',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SMS settings retrieved successfully',
    type: SmsSettingsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch SMS settings',
  })
  async getSmsSettings(@TbAccessToken() accessToken: string) {
    const query = new FetchSmsSettingsQuery(accessToken);
    const result: Result<SmsSettingsDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (settings: SmsSettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/admin/settings/sms')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update SMS settings',
    description: 'Update SMS provider settings',
  })
  @ApiBody({
    type: SmsSettingsDto,
    description: 'SMS settings to update',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SMS settings updated successfully',
    type: SmsSettingsDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to update SMS settings',
  })
  async updateSmsSettings(
    @Body() settings: SmsSettingsDto,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new UpdateSmsSettingsCommand(settings, accessToken);
    const result: Result<SmsSettingsDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (settings: SmsSettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/notification/settings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get notification settings',
    description: 'Retrieve notification settings including Slack configuration',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification settings retrieved successfully',
    type: NotificationSettingsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch notification settings',
  })
  async getNotificationSettings(@TbAccessToken() accessToken: string) {
    const query = new FetchNotificationSettingsQuery(accessToken);
    const result: Result<NotificationSettingsDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (settings: NotificationSettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/notification/settings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update notification settings',
    description: 'Update notification settings including Slack configuration',
  })
  @ApiBody({
    type: NotificationSettingsDto,
    description: 'Notification settings to update',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification settings updated successfully',
    type: NotificationSettingsDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to update notification settings',
  })
  async updateNotificationSettings(
    @Body() settings: NotificationSettingsDto,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new UpdateNotificationSettingsCommand(
      settings,
      accessToken,
    );
    const result: Result<NotificationSettingsDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (settings: NotificationSettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('queues')
  @ApiOperation({ summary: 'Fetch queues' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: QueuesPageResponseDto,
  })
  async fetchQueues(
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const query = new FetchQueuesQuery(
      accessToken,
      page,
      pageSize,
      sortProperty,
      sortOrder,
    );
    const result: Result<QueuesPageResponseDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: QueuesPageResponseDto) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }


  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('rule-chains')
  @ApiOperation({ summary: 'Fetch rule chains (kabob-case)' })
  async fetchRuleChains(
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('type') type?: 'CORE' | 'EDGE',
  ) {
    const result = await this.queryBus.execute(
      new FetchRuleChainsQuery(
        accessToken,
        page,
        pageSize,
        type,
        sortProperty,
        sortOrder,
      ),
    );

    return result.unwrap();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('rule-chains/:id')
  @ApiOperation({ summary: 'Fetch rule chain by id' })
  async fetchRuleChainById(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    const result = await this.queryBus.execute(
      new FetchRuleChainByIdQuery(accessToken, id),
    );
    return result.unwrap();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('rule-chains/:id/attributes')
  async getRuleChainAttributes(@TbAccessToken() accessToken: string, @Param('id') id: string, @Query('scope') scopeParam?: string) {
    const scope = (scopeParam || 'SERVER_SCOPE').toUpperCase() as any;
    const result = await this.queryBus.execute(
      new FetchEntityAttributesQuery(accessToken, 'RULE_CHAIN', id, scope),
    );
    return result.unwrap();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('rule-chains/:id/attributes')
  async saveRuleChainAttributes(@TbAccessToken() accessToken: string, @Param('id') id: string, @Query('scope') scopeParam: string, @Body() attributes: any) {
    const scope = (scopeParam || 'SERVER_SCOPE').toUpperCase() as any;
    const result = await this.commandBus.execute(
      new SaveEntityAttributesCommand('RULE_CHAIN', id, scope as any, attributes, accessToken),
    );
    return result.unwrap();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('rule-chains/:id/attributes')
  async deleteRuleChainAttributes(@TbAccessToken() accessToken: string, @Param('id') id: string, @Query('scope') scopeParam: string, @Query('keys') keys: string) {
    const scope = (scopeParam || 'SERVER_SCOPE').toUpperCase() as any;
    const result = await this.commandBus.execute(
      new DeleteEntityAttributesCommand(accessToken, 'RULE_CHAIN', id, scope, keys),
    );
    return result.unwrap();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('rule-chains/:id/alarms')
  async getRuleChainAlarms(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('statusList') statusList?: string,
    @Query('severityList') severityList?: string,
    @Query('startTime') startTime?: number,
    @Query('endTime') endTime?: number,
  ) {
    const result = await this.queryBus.execute(
      new FetchEntityAlarmsQuery(
        accessToken,
        'RULE_CHAIN',
        id,
        page,
        pageSize,
        statusList ? statusList.split(',') : undefined,
        severityList ? severityList.split(',') : undefined,
        startTime,
        endTime,
      ),
    );
    return result.unwrap();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('rule-chains/:id/events')
  async getRuleChainEvents(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body() body: any,
    @Query('tenantId') tenantId: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('startTime') startTime?: number,
    @Query('endTime') endTime?: number,
  ) {
    const result = await this.queryBus.execute(
      new FetchEntityEventsQuery(
        accessToken,
        'RULE_CHAIN',
        id,
        tenantId || id, // Fallback to id if tenantId not provided, although TB usually wants the actual tenantId
        body.eventType || 'LC_EVENT',
        page,
        pageSize,
        sortProperty,
        sortOrder,
        startTime,
        endTime,
      ),
    );
    return result.unwrap();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('rule-chains/:id/relations')
  async getRuleChainRelations(@TbAccessToken() accessToken: string, @Param('id') id: string, @Query('direction') direction: 'FROM' | 'TO' = 'FROM') {
    const result = await this.queryBus.execute(
      new FetchEntityRelationsQuery(accessToken, 'RULE_CHAIN', id, direction),
    );
    return result.unwrap();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('rule-chains/:id/relations')
  async saveRuleChainRelation(@TbAccessToken() accessToken: string, @Param('id') id: string, @Body() body: any) {
    const result = await this.commandBus.execute(
      new CreateRelationCommand(
        body.from.id,
        body.from.entityType,
        body.to.id,
        body.to.entityType,
        body.type,
        body.additionalInfo,
        accessToken,
      ),
    );
    return result.unwrap();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('rule-chains/:id/relations')
  async deleteRuleChainRelation(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('relatedEntityId') relatedEntityId: string,
    @Query('relatedEntityType') relatedEntityType: string,
    @Query('relationType') relationType: string,
    @Query('direction') direction: 'FROM' | 'TO'
  ) {
    const fromId = direction === 'FROM' ? id : relatedEntityId;
    const fromType = direction === 'FROM' ? 'RULE_CHAIN' : relatedEntityType;
    const toId = direction === 'FROM' ? relatedEntityId : id;
    const toType = direction === 'FROM' ? relatedEntityType : 'RULE_CHAIN';

    const result = await this.commandBus.execute(
      new DeleteRelationCommand(fromId, fromType, toId, toType, relationType, accessToken),
    );
    return result.unwrap();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('rule-chains/:id/audit-logs')
  async getRuleChainAuditLogs(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('startTime') startTime?: number,
    @Query('endTime') endTime?: number,
  ) {
    const result = await this.queryBus.execute(
      new FetchEntityAuditLogsQuery(
        accessToken,
        'RULE_CHAIN',
        id,
        page,
        pageSize,
        sortProperty,
        sortOrder,
        startTime,
        endTime,
      ),
    );
    return result.unwrap();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('rule-chains/:id/telemetry/latest')
  async getRuleChainTelemetry(@TbAccessToken() accessToken: string, @Param('id') id: string, @Query('keys') keys?: string) {
    const result = await this.queryBus.execute(
      new FetchEntityTelemetryQuery(accessToken, 'RULE_CHAIN', id, keys ? keys.split(',') : undefined),
    );
    return result.unwrap();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('rule-chains/:id/telemetry/latest/keys')
  async getRuleChainTelemetryKeys(@TbAccessToken() accessToken: string, @Param('id') id: string) {
    const result = await this.queryBus.execute(
      new FetchEntityTelemetryKeysQuery(accessToken, 'RULE_CHAIN', id),
    );
    return result.unwrap();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('queues/name/:queueName')
  @ApiOperation({ summary: 'Fetch queue by name' })
  async fetchQueueByName(
    @TbAccessToken() accessToken: string,
    @Param('queueName') queueName: string,
  ) {
    return this.thingsboardApi.fetchQueueByName(accessToken, queueName);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('rule-chains-deprecated/:ruleChainId')
  @ApiOperation({ summary: 'Deprecated Fetch rule chain by id' })
  async fetchRuleChainByIdDeprecated(
    @TbAccessToken() accessToken: string,
    @Param('ruleChainId') ruleChainId: string,
  ) {
    return this.thingsboardApi.fetchRuleChainById(accessToken, ruleChainId);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Post('queues')
  @ApiOperation({ summary: 'Create or update queue' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: QueueDto,
  })
  async createQueue(
    @Body() queue: QueueDto,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new CreateQueueCommand(queue, accessToken);
    const result: Result<QueueDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: QueueDto) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('queues/:queueId')
  @ApiOperation({ summary: 'Delete queue' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  async deleteQueue(
    @Param('queueId') queueId: string,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new DeleteQueueCommand(queueId, accessToken);
    const result: Result<void, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: () => { },
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  // Resource endpoints
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('resources')
  @ApiOperation({ summary: 'Fetch resources' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ResourcesPageResponseDto,
  })
  async fetchResources(
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('resourceType') resourceType?: string,
    @Query('resourceSubType') resourceSubType?: string,
  ) {
    const query = new FetchResourcesQuery(
      accessToken,
      page,
      pageSize,
      sortProperty,
      sortOrder,
      resourceType,
      resourceSubType,
    );
    const result: Result<ResourcesPageResponseDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: ResourcesPageResponseDto) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('resources/lwm2m/page')
  @ApiOperation({ summary: 'Fetch LWM2M objects page' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'LWM2M objects list fetched successfully',
  })
  async fetchLwm2mObjectsPage(
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 50,
    @Query('sortProperty') sortProperty = 'resourceKey',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('textSearch') textSearch?: string,
  ) {
    return await this.thingsboardApi.fetchLwm2mObjectsPage(
      accessToken,
      Number(page),
      Number(pageSize),
      sortProperty,
      sortOrder,
      textSearch,
    );
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('resource/info/:resourceId')
  @ApiOperation({ summary: 'Get resource info' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ResourceDto,
  })
  async getResourceInfo(
    @Param('resourceId') resourceId: string,
    @TbAccessToken() accessToken: string,
  ) {
    const query = new FetchResourceInfoQuery(resourceId, accessToken);
    const result: Result<ResourceDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: ResourceDto) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('resources')
  @ApiOperation({ summary: 'Create resource' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ResourceDto,
  })
  async createResource(
    @Body() resource: ResourceCreateDto,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new CreateResourceCommand(resource, accessToken);
    const result: Result<ResourceDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: ResourceDto) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('resources/:resourceId')
  @ApiOperation({ summary: 'Delete resource' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  async deleteResource(
    @Param('resourceId') resourceId: string,
    @TbAccessToken() accessToken: string,
    @Query('force') force: boolean = false,
  ) {
    const command = new DeleteResourceCommand(resourceId, accessToken, force);
    const result: Result<void, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: () => { },
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('resources/:resourceId/download')
  @ApiOperation({ summary: 'Download resource' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resource file',
  })
  async downloadResource(
    @Param('resourceId') resourceId: string,
    @TbAccessToken() accessToken: string,
    @Res() res: any,
  ) {
    const query = new DownloadResourceQuery(resourceId, accessToken);
    const result: Result<Buffer, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (buffer: Buffer) => {
        res.set({
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="resource"`,
        });
        res.send(buffer);
      },
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @UseGuards(ThingsboardAuthGuard)
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @Get('/notification/deliveryMethods')
  @ApiOperation({
    summary: 'Get available notification delivery methods',
    description:
      'Retrieve list of available delivery methods for notifications (Web, Email, SMS, etc.)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delivery methods retrieved successfully',
    type: DeliveryMethodsResponse,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch delivery methods',
  })
  async getDeliveryMethods(@TbAccessToken() accessToken: string) {
    const query = new FetchDeliveryMethodsQuery(accessToken);
    const result: Result<DeliveryMethodsResponse, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: DeliveryMethodsResponse) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @UseGuards(ThingsboardAuthGuard)
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @Post('/notification/send')
  @ApiOperation({
    summary: 'Send a notification',
    description:
      'Send a notification to specified targets using ThingsBoard notification system',
  })
  @ApiBody({
    type: SendNotificationRequestDto,
    description: 'Notification request data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification sent successfully',
    type: NotificationRequestResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to send notification',
  })
  async sendNotification(
    @Body() notificationRequest: SendNotificationRequestDto,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new SendNotificationCommand(
      accessToken,
      notificationRequest,
    );
    const result: Result<NotificationRequestResponse, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: NotificationRequestResponse) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @UseGuards(ThingsboardAuthGuard)
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @Post('notification/target')
  async createNotificationTarget(
    @Body() request: CreateNotificationTargetRequestDto,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new CreateNotificationTargetCommand(accessToken, request);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (target) => target,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @UseGuards(ThingsboardAuthGuard)
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @Get('notification/targets/legacy')
  async fetchNotificationTargets(@TbAccessToken() accessToken: string) {
    const query = new FetchNotificationTargetsQuery(accessToken);
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @UseGuards(ThingsboardAuthGuard)
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @Post('notification/request/preview')
  async previewNotificationRequest(
    @Body() previewRequest: any,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new PreviewNotificationRequestCommand(
      accessToken,
      previewRequest,
    );
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @UseGuards(ThingsboardAuthGuard)
  @Get('material-icons')
  async fetchMaterialIcons(@TbAccessToken() accessToken: string) {
    const query = new FetchMaterialIconsQuery(accessToken);
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (icons) => icons,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('notification/requests')
  @ApiOperation({
    summary: 'Get notification requests',
    description:
      'Retrieve paginated list of sent notification requests with stats',
  })
  @ApiOkResponse({
    description: 'Successfully fetched notification requests',
  })
  @ApiBadRequestResponse({
    description: 'Invalid parameters',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to fetch notification requests',
  })
  async getNotificationRequests(
    @TbAccessToken() accessToken: string,
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const query = new FetchNotificationRequestsQuery(accessToken, {
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      page: page ? parseInt(page, 10) : 0,
      sortProperty: sortProperty || 'createdTime',
      sortOrder: sortOrder || 'DESC',
    });
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('notification/templates')
  @ApiOperation({
    summary: 'Get notification templates',
    description: 'Retrieve paginated list of notification templates',
  })
  @ApiOkResponse({
    description: 'Successfully fetched notification templates',
  })
  @ApiBadRequestResponse({
    description: 'Invalid parameters',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to fetch notification templates',
  })
  async getNotificationTemplates(
    @TbAccessToken() accessToken: string,
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('notificationTypes') notificationTypes?: string,
  ) {
    const query = new FetchNotificationTemplatesQuery(accessToken, {
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      page: page ? parseInt(page, 10) : 0,
      sortProperty: sortProperty || 'createdTime',
      sortOrder: sortOrder || 'DESC',
      notificationTypes,
    });
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('notification/rules')
  @ApiOperation({
    summary: 'Get notification rules',
    description: 'Retrieve paginated list of notification rules',
  })
  @ApiOkResponse({
    description: 'Successfully fetched notification rules',
  })
  @ApiBadRequestResponse({
    description: 'Invalid parameters',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to fetch notification rules',
  })
  async getNotificationRules(
    @TbAccessToken() accessToken: string,
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const query = new FetchNotificationRulesQuery(accessToken, {
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      page: page ? parseInt(page, 10) : 0,
      sortProperty: sortProperty || 'createdTime',
      sortOrder: sortOrder || 'DESC',
    });
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('notification/targets')
  @ApiOperation({
    summary: 'Get notification targets',
    description: 'Retrieve paginated list of notification targets',
  })
  @ApiOkResponse({
    description: 'Successfully fetched notification targets',
  })
  @ApiBadRequestResponse({
    description: 'Invalid parameters',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to fetch notification targets',
  })
  async getNotificationTargets(
    @TbAccessToken() accessToken: string,
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const query = new FetchNotificationTargetsQuery(accessToken, {
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      page: page ? parseInt(page, 10) : 0,
      sortProperty: sortProperty || 'createdTime',
      sortOrder: sortOrder || 'DESC',
    });
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('notification/template')
  @ApiOperation({
    summary: 'Create notification template',
    description: 'Create a new notification template',
  })
  @ApiOkResponse({
    description: 'Successfully created notification template',
  })
  @ApiBadRequestResponse({
    description: 'Invalid parameters',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to create notification template',
  })
  async createNotificationTemplate(
    @Body() templateData: CreateNotificationTemplateRequestDto,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new CreateNotificationTemplateCommand(
      accessToken,
      templateData,
    );
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('notification/rule')
  @ApiOperation({
    summary: 'Create notification rule',
    description: 'Create a new notification rule',
  })
  @ApiOkResponse({
    description: 'Successfully created notification rule',
  })
  @ApiBadRequestResponse({
    description: 'Invalid parameters',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to create notification rule',
  })
  async createNotificationRule(
    @Body() rule: CreateNotificationRuleRequestDto,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new CreateNotificationRuleCommand(rule, accessToken);
    const result: Result<any, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('images')
  @ApiOperation({ summary: 'Upload image' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ImageDto,
  })
  async uploadImage(
    @Body()
    body: {
      file: string;
      fileName: string;
      title: string;
      imageSubType?: string;
    },
    @TbAccessToken() accessToken: string,
  ) {
    // Convert base64 file to Buffer
    const fileBuffer = Buffer.from(body.file, 'base64');
    const command = new UploadImageCommand(
      fileBuffer,
      body.fileName,
      body.title,
      accessToken,
      body.imageSubType || 'IMAGE',
    );
    const result: Result<ImageDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: ImageDto) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @SkipThrottle()
  @Get('images/download/:encodedLink')
  @ApiOperation({ summary: 'Download image' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image file',
  })
  async downloadImage(
    @Param('encodedLink') encodedLink: string,
    @TbAccessToken() accessToken: string,
    @Res() res: any,
  ) {
    const imageLink = decodeURIComponent(encodedLink);
    const query = new DownloadImageQuery(imageLink, accessToken);
    const result: Result<Buffer, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (buffer: Buffer) => {
        let contentType = 'application/octet-stream';

        // Infer content type for SVGs to ensure proper rendering
        if (
          imageLink.toLowerCase().includes('.svg') ||
          buffer.slice(0, 100).toString().toLowerCase().includes('<svg')
        ) {
          contentType = 'image/svg+xml';
        } else if (buffer.slice(0, 4).toString('hex') === '89504e47') {
          contentType = 'image/png';
        } else if (buffer.slice(0, 3).toString('hex') === 'ffd8ff') {
          contentType = 'image/jpeg';
        }

        res.set({
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="image"`,
        });
        res.send(buffer);
      },
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('admin/settings/mail')
  @ApiOperation({ summary: 'Get mail settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail settings',
    type: MailSettingsDto,
  })
  async fetchMailSettings(@TbAccessToken() accessToken: string) {
    const query = new FetchMailSettingsQuery(accessToken);
    const result: Result<MailSettingsDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (settings: MailSettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Post('admin/settings/mail')
  @ApiOperation({ summary: 'Update mail settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated mail settings',
    type: MailSettingsDto,
  })
  async updateMailSettings(
    @Body() settings: MailSettingsDto,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new UpdateMailSettingsCommand(settings, accessToken);
    const result: Result<MailSettingsDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (updated: MailSettingsDto) => updated,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @ApiBearerAuth()
  @UseGuards(ThingsboardAuthGuard)
  @Get('images/export/:encodedLink')
  @ApiOperation({ summary: 'Export image to JSON' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ImageExportDto,
  })
  async exportImage(
    @Param('encodedLink') encodedLink: string,
    @TbAccessToken() accessToken: string,
  ) {
    const imageLink = decodeURIComponent(encodedLink);
    const query = new ExportImageQuery(imageLink, accessToken);
    const result: Result<ImageExportDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: ImageExportDto) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @ApiBearerAuth()
  @UseGuards(ThingsboardAuthGuard)
  @Delete('images/:encodedLink')
  @ApiOperation({ summary: 'Delete image' })
  @ApiQuery({ name: 'force', required: false, type: Boolean })
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteImageResponseDto,
  })
  async deleteImage(
    @Param('encodedLink') encodedLink: string,
    @TbAccessToken() accessToken: string,
    @Query('force') force: boolean = false,
  ) {
    const imageLink = decodeURIComponent(encodedLink);
    const command = new DeleteImageCommand(imageLink, accessToken, force);
    const result: Result<DeleteImageResponseDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: DeleteImageResponseDto) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/widgetTypes')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get widget types',
    description: 'Fetch paginated list of widget types from ThingsBoard',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (zero-based)',
    example: 0,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sortProperty',
    required: false,
    type: String,
    description: 'Property to sort by',
    example: 'createdTime',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
    example: 'DESC',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of widget types retrieved successfully',
    type: WidgetTypesPageDto,
  })
  async getWidgetTypes(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('tenantOnly') tenantOnly = false,
    @Query('fullSearch') fullSearch = false,
    @Query('scadaFirst') scadaFirst = false,
    @Query('deprecatedFilter') deprecatedFilter = 'ALL',
    @Query('widgetsBundleId') widgetsBundleId = '',
    @TbAccessToken() accessToken: string,
  ) {
    const query = new FetchWidgetTypesQuery(
      Number(page),
      Number(pageSize),
      sortProperty,
      sortOrder,
      tenantOnly === true || String(tenantOnly) === 'true',
      fullSearch === true || String(fullSearch) === 'true',
      scadaFirst === true || String(scadaFirst) === 'true',
      deprecatedFilter,
      widgetsBundleId,
      accessToken,
    );
    const result: Result<WidgetTypesPageDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (widgetTypes: WidgetTypesPageDto) => widgetTypes,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/widgetType/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get widget type by ID',
    description: 'Fetch a single widget type by its ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Widget type retrieved successfully',
    type: WidgetTypeDto,
  })
  async getWidgetTypeById(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
  ) {
    const query = new FetchWidgetTypeByIdQuery(id, accessToken);
    const result: Result<WidgetTypeDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (widgetType: WidgetTypeDto) => widgetType,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/widgetType/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete widget type',
    description: 'Delete a widget type by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Widget type deleted successfully',
  })
  async deleteWidgetType(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new DeleteWidgetTypeCommand(id, accessToken);
    const result: Result<void, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: () => ({ success: true }),
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/widgetType')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save (create or update) widget type',
    description: 'Save (create or update) a widget type',
  })
  @ApiBody({ type: CreateWidgetTypeRequestDto })
  @ApiQuery({ name: 'updateExistingByFqn', required: false, type: Boolean })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Widget type saved successfully',
    type: WidgetTypeDto,
  })
  async saveWidgetType(
    @Body() widgetType: any,
    @TbAccessToken() accessToken: string,
    @Query('updateExistingByFqn') updateExistingByFqn: boolean = false,
  ) {
    const command = new SaveWidgetTypeCommand(
      widgetType,
      accessToken,
      updateExistingByFqn,
    );
    const result: Result<WidgetTypeDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: WidgetTypeDto) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/widgetType/:id/download')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download widget type',
    description: 'Download a widget type by ID',
  })
  @ApiQuery({ name: 'includeResources', required: false, type: Boolean })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Widget type downloaded successfully',
  })
  async downloadWidgetType(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
    @Query('includeResources') includeResources: boolean = false,
  ) {
    const query = new DownloadWidgetTypeQuery(
      id,
      accessToken,
      includeResources,
    );
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/images')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get images',
    description: 'Fetch paginated list of images',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of images retrieved successfully',
    type: ImagesPageResponseDto,
  })
  async getImages(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('textSearch') textSearch = '',
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('imageSubType') imageSubType = 'IMAGE',
    @Query('includeSystemImages') includeSystemImages = false,
    @TbAccessToken() accessToken: string,
  ) {
    const query = new FetchImagesQuery(
      Number(page),
      Number(pageSize),
      sortProperty,
      sortOrder,
      imageSubType,
      includeSystemImages === true || String(includeSystemImages) === 'true',
      textSearch,
      accessToken,
    );
    const result: Result<ImagesPageResponseDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (images: ImagesPageResponseDto) => images,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/widgetBundles')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get widget bundles',
    description: 'Fetch paginated list of widget bundles',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of widget bundles retrieved successfully',
    type: WidgetBundlesPageDto,
  })
  async getWidgetBundles(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'title',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @TbAccessToken() accessToken: string,
    @Query('tenantOnly') tenantOnly = false,
    @Query('fullSearch') fullSearch = false,
    @Query('scadaFirst') scadaFirst = false,
  ) {
    const query = new FetchWidgetBundlesQuery(
      Number(page),
      Number(pageSize),
      sortProperty,
      sortOrder,
      tenantOnly === true || String(tenantOnly) === 'true',
      fullSearch === true || String(fullSearch) === 'true',
      scadaFirst === true || String(scadaFirst) === 'true',
      accessToken,
    );
    const result: Result<WidgetBundlesPageDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (items: WidgetBundlesPageDto) => items,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/widgetBundle/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get widget bundle by id',
    description: 'Fetch widget bundle details by id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Widget bundle retrieved successfully',
    type: WidgetBundleDto,
  })
  async getWidgetBundleById(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
  ) {
    const query = new FetchWidgetBundleByIdQuery(id, accessToken);
    const result: Result<WidgetBundleDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (item: WidgetBundleDto) => item,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/widgetBundle')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save widget bundle',
    description: 'Create or update a widget bundle',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Widget bundle saved successfully',
  })
  async saveWidgetBundle(
    @Body() saveWidgetBundleRequest: SaveWidgetBundleRequestDto,
    @TbAccessToken() accessToken: string,
  ) {
    const command = new SaveWidgetBundleCommand(
      saveWidgetBundleRequest,
      accessToken,
    );
    const result: Result<any, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/2fa/settings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get 2FA settings',
    description: 'Retrieve current 2FA configuration',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '2FA settings retrieved successfully',
    type: TwoFactorAuthSettingsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch 2FA settings',
  })
  async getTwoFaSettings(@TbAccessToken() accessToken: string) {
    const query = new FetchTwoFaSettingsQuery(accessToken);
    const result: Result<TwoFactorAuthSettingsDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (settings: TwoFactorAuthSettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/2fa/settings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save 2FA settings',
    description: 'Update 2FA configuration',
  })
  @ApiBody({
    type: TwoFactorAuthSettingsRequestDto,
    description: '2FA settings to update',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '2FA settings updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request payload',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired access token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to update 2FA settings',
  })
  async saveTwoFaSettings(
    @TbAccessToken() accessToken: string,
    @Body() settings: TwoFactorAuthSettingsRequestDto,
  ) {
    const command = new SaveTwoFaSettingsCommand(accessToken, settings);
    const result: Result<any, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: () => ({ success: true }),
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/widgetsBundles')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get widgets bundles',
    description: 'Fetch paginated list of widgets bundles from ThingsBoard',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (zero-based)',
    example: 0,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sortProperty',
    required: false,
    type: String,
    description: 'Property to sort by',
    example: 'createdTime',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
    example: 'DESC',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of widgets bundles retrieved successfully',
  })
  async getWidgetsBundles(
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('tenantOnly') tenantOnly = false,
    @Query('fullSearch') fullSearch = false,
    @Query('scadaFirst') scadaFirst = false,
    @Query('deprecatedFilter') deprecatedFilter = 'ALL',
  ) {
    const query = new FetchWidgetsBundlesQuery(
      accessToken,
      Number(page),
      Number(pageSize),
      sortProperty,
      sortOrder,
      tenantOnly === true || String(tenantOnly) === 'true',
      fullSearch === true || String(fullSearch) === 'true',
      scadaFirst === true || String(scadaFirst) === 'true',
      deprecatedFilter,
    );
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (widgetsBundles: any) => widgetsBundles,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/widgetsBundle/:widgetsBundleId/widgetTypeFqns')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get widget type FQNs',
    description: 'Fetch widget type FQNs for a specific widgets bundle',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Widget type FQNs retrieved successfully',
  })
  async getWidgetTypeFqns(
    @TbAccessToken() accessToken: string,
    @Param('widgetsBundleId') widgetsBundleId: string,
  ) {
    const query = new FetchWidgetTypeFqnsQuery(accessToken, widgetsBundleId);
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (fqns: any) => fqns,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/widgetsBundle/:widgetsBundleId/widgetTypeFqns')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save widget type FQNs',
    description: 'Save widget type FQNs for a specific widgets bundle',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Widget type FQNs saved successfully',
  })
  async saveWidgetTypeFqns(
    @TbAccessToken() accessToken: string,
    @Param('widgetsBundleId') widgetsBundleId: string,
    @Body() fqns: string[],
  ) {
    const command = new SaveWidgetTypeFqnsCommand(
      accessToken,
      widgetsBundleId,
      fqns,
    );
    const result: Result<any, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  // OTA Package endpoints
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/otaPackages')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get OTA packages',
    description: 'Retrieve paginated list of OTA packages',
  })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'sortProperty', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTA packages retrieved successfully',
  })
  async getOtaPackages(
    @TbAccessToken() accessToken: string,
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const query = new FetchOtaPackagesQuery({
      accessToken,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      page: page ? parseInt(page, 10) : 0,
      sortProperty: sortProperty || 'createdTime',
      sortOrder: (sortOrder as 'ASC' | 'DESC') || 'DESC',
    });
    const result: Result<OtaPackagesPageResponseDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: OtaPackagesPageResponseDto) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/otaPackage')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create OTA package',
    description: 'Create a new OTA package',
  })
  @ApiBody({ type: CreateOtaPackageRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTA package created successfully',
  })
  async createOtaPackage(
    @TbAccessToken() accessToken: string,
    @Body() payload: CreateOtaPackageRequestDto,
  ) {
    const command = new CreateOtaPackageCommand(accessToken, payload);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/otaPackage/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete OTA package',
    description: 'Delete an OTA package by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTA package deleted successfully',
  })
  async deleteOtaPackage(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    const command = new DeleteOtaPackageCommand(accessToken, id);
    const result: Result<void, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: () => ({ success: true }),
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/otaPackage/:id/download')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download OTA package',
    description: 'Download OTA package binary by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTA package downloaded successfully',
  })
  async downloadOtaPackage(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Res() res: any,
  ) {
    const query = new DownloadOtaPackageQuery(accessToken, id);
    const result: Result<Buffer, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (buffer: Buffer) => {
        res.set({
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': 'attachment',
        });
        res.send(buffer);
      },
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/device-profiles')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get device profiles',
    description: 'Retrieve paginated list of full device profiles',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device profiles retrieved successfully',
    type: DeviceProfilesResponseDto,
  })
  async getDeviceProfiles(
    @TbAccessToken() accessToken: string,
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('textSearch') textSearch?: string,
  ) {
    const query = new FetchDeviceProfilesQuery({
      accessToken,
      page: page ? parseInt(page, 10) : 0,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      sortProperty: sortProperty || 'createdTime',
      sortOrder: (sortOrder as 'ASC' | 'DESC') || 'DESC',
      textSearch,
    });
    const result: Result<DeviceProfilesResponse, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: DeviceProfilesResponse) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/device-profiles/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get device profile details',
    description: 'Retrieve full details for a single device profile',
  })
  async getDeviceProfileById(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    return this.thingsboardApi.getDeviceProfile(id, accessToken, false);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/device-profiles/:id/attributes')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get device profile attributes',
    description: 'Retrieve attributes for a specific device profile by scope',
  })
  async getDeviceProfileAttributes(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('scope') scopeParam?: string,
  ) {
    const scope = (scopeParam || 'SERVER_SCOPE').toUpperCase() as any;

    if (
      scope !== 'SERVER_SCOPE' &&
      scope !== 'CLIENT_SCOPE' &&
      scope !== 'SHARED_SCOPE'
    ) {
      throw new BadRequestException('Invalid scope value');
    }

    return this.thingsboardApi.fetchEntityAttributes(
      accessToken,
      'DEVICE_PROFILE',
      id,
      scope,
    );
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/device-profiles/:id/attributes/keys')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get device profile attribute keys',
    description:
      'Retrieve attribute keys for a specific device profile using ThingsBoard deviceProfile keys endpoint',
  })
  async getDeviceProfileAttributeKeys(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('scope') scopeParam?: string,
  ) {
    const scope = (scopeParam || 'SERVER_SCOPE').toUpperCase() as any;

    if (
      scope !== 'SERVER_SCOPE' &&
      scope !== 'CLIENT_SCOPE' &&
      scope !== 'SHARED_SCOPE'
    ) {
      throw new BadRequestException('Invalid scope value');
    }

    return this.thingsboardApi.fetchDeviceProfileDeviceAttributeKeys(
      accessToken,
      id,
    );
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/device-profiles/:id/telemetry/latest/keys')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get device profile latest telemetry keys',
    description:
      'Retrieve telemetry keys for a specific device profile using ThingsBoard deviceProfile keys endpoint',
  })
  async getDeviceProfileLatestTelemetryKeys(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    return this.thingsboardApi.fetchDeviceProfileDeviceTimeseriesKeys(
      accessToken,
      id,
    );
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/device-profiles/:id/calculated-fields')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get calculated fields for device profile',
    description:
      'Retrieve paginated calculated fields for a specific device profile',
  })
  async getDeviceProfileCalculatedFields(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    return this.thingsboardApi.fetchDeviceProfileCalculatedFields(
      accessToken,
      id,
      Number(page),
      Number(pageSize),
      sortProperty,
      sortOrder,
    );
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/device-profiles/:id/calculated-fields')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create calculated field for device profile',
    description:
      'Create a calculated field using ThingsBoard calculatedField API for a device profile',
  })
  async createDeviceProfileCalculatedField(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body()
    payload: {
      title: string;
      fieldType: 'simple' | 'script';
      expression: string;
      outputKey?: string;
      outputType?: 'TIME_SERIES' | 'ATTRIBUTES';
      attributeScope?: 'SERVER_SCOPE' | 'SHARED_SCOPE';
      useLatestTimestamp?: boolean;
      arguments: Array<{
        argumentName: string;
        entityType:
        | 'current_entity'
        | 'device'
        | 'asset'
        | 'customer'
        | 'current_tenant';
        argumentType: 'attribute' | 'latest_telemetry';
        refEntityId?: string;
        timeSeriesKey?: string;
        name?: string;
        defaultValue?: string;
      }>;
      failuresEnabled?: boolean;
      allEnabled?: boolean;
      decimalsByDefault?: number;
      id?: { id: string; entityType: string };
    },
  ) {
    if (!payload?.title?.trim()) {
      throw new BadRequestException('Field title is required');
    }

    if (!Array.isArray(payload?.arguments) || payload.arguments.length === 0) {
      throw new BadRequestException('At least one argument is required');
    }

    if (!payload?.expression?.trim()) {
      throw new BadRequestException('Expression is required');
    }

    if (payload.fieldType === 'simple' && !payload?.outputKey?.trim()) {
      throw new BadRequestException('Output key is required for simple type');
    }

    const mappedArguments = payload.arguments.reduce<Record<string, unknown>>(
      (acc, argument) => {
        const argumentName = argument.argumentName?.trim();
        if (!argumentName) {
          return acc;
        }

        const refKey = argument.timeSeriesKey?.trim() || argument.name?.trim();

        if (!refKey) {
          return acc;
        }

        const entityTypeMap: Record<string, string> = {
          current_entity: 'CURRENT_ENTITY',
          device: 'DEVICE',
          asset: 'ASSET',
          customer: 'CUSTOMER',
          current_tenant: 'CURRENT_TENANT',
        };

        const typeMap: Record<string, string> = {
          latest_telemetry: 'TS_LATEST',
          attribute: 'ATTRIBUTE',
        };

        const mappedEntityType =
          entityTypeMap[argument.entityType] || 'CURRENT_ENTITY';

        acc[argumentName] = {
          refEntityKey: {
            type: typeMap[argument.argumentType] || 'TS_LATEST',
            key: refKey,
          },
          ...(argument.refEntityId?.trim()
            ? {
              refEntityId: {
                entityType: mappedEntityType,
                id: argument.refEntityId.trim(),
              },
            }
            : {}),
          defaultValue: argument.defaultValue ?? '',
        };

        return acc;
      },
      {},
    );

    const outputType =
      payload.outputType === 'ATTRIBUTES' ? 'ATTRIBUTES' : 'TIME_SERIES';
    const outputName =
      payload.outputKey?.trim() ||
      payload.title?.trim() ||
      payload.expression.trim();

    if (Object.keys(mappedArguments).length === 0) {
      throw new BadRequestException('At least one valid argument is required');
    }

    const command = new CreateDeviceCalculatedFieldCommand(accessToken, {
      entityId: { entityType: 'DEVICE_PROFILE', id },
      ...(payload.id ? { id: payload.id } : {}),
      configuration: {
        arguments: mappedArguments,
        useLatestTs: payload.useLatestTimestamp ?? false,
        type: payload.fieldType?.toUpperCase() || 'SIMPLE',
        expression: payload.expression.trim(),
        output: {
          name: outputName,
          type: outputType,
          ...(outputType === 'ATTRIBUTES'
            ? {
              scope:
                payload.attributeScope === 'SHARED_SCOPE'
                  ? 'SHARED_SCOPE'
                  : 'SERVER_SCOPE',
            }
            : {}),
          decimalsByDefault: payload.decimalsByDefault ?? 2,
        },
      },
      name: payload.title.trim(),
      type: payload.fieldType?.toUpperCase() || 'SIMPLE',
      debugSettings: {
        failuresEnabled: payload.failuresEnabled ?? true,
        allEnabled: payload.allEnabled ?? true,
      },
    });

    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/device-profiles/:id/audit-logs')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get device profile audit logs',
    description: 'Retrieve paginated audit logs for a specific device profile',
  })
  async getDeviceProfileAuditLogs(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    return this.thingsboardApi.fetchEntityAuditLogs(
      accessToken,
      'DEVICE_PROFILE',
      id,
      Number(page),
      Number(pageSize),
      sortProperty,
      sortOrder,
      startTime ? Number(startTime) : undefined,
      endTime ? Number(endTime) : undefined,
    );
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/device-profiles')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create device profile',
    description: 'Create a new device profile',
  })
  async createDeviceProfile(
    @TbAccessToken() accessToken: string,
    @Body() payload: any,
  ) {
    await this.thingsboardApi.updateDeviceProfile(payload, accessToken);
    return { success: true };
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/device-profiles/:id/export')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Export device profile',
    description: 'Export single device profile with optional inline images',
  })
  async exportDeviceProfile(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('inlineImages') inlineImages = 'true',
  ) {
    return this.thingsboardApi.getDeviceProfile(
      id,
      accessToken,
      inlineImages === 'true',
    );
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/device-profiles/:id/default')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Make device profile default',
    description: 'Set selected device profile as default profile',
  })
  async makeDeviceProfileDefault(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    await this.thingsboardApi.makeDeviceProfileDefault(accessToken, id);
    return { success: true };
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/device-profiles/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete device profile',
    description: 'Delete selected device profile',
  })
  async deleteDeviceProfile(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    await this.thingsboardApi.deleteDeviceProfile(accessToken, id);
    return { success: true };
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/deviceProfileInfos')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get device profile infos',
    description: 'Retrieve paginated list of device profile infos',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device profile infos retrieved successfully',
  })
  async getDeviceProfileInfos(
    @TbAccessToken() accessToken: string,
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const query = new FetchDeviceProfileInfosQuery(
      accessToken,
      page ? parseInt(page, 10) : 0,
      pageSize ? parseInt(pageSize, 10) : 100,
      sortProperty || 'name',
      (sortOrder as 'ASC' | 'DESC') || 'ASC',
    );
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  // Version Control endpoints
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/repositorySettings/info')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get repository settings info',
    description: 'Check if version control is configured',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Repository settings info retrieved',
  })
  async getRepoSettingsInfo(@TbAccessToken() accessToken: string) {
    const query = new FetchRepoSettingsInfoQuery(accessToken);
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/repositorySettings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get repository settings',
    description: 'Get full repository settings configuration',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Repository settings retrieved',
  })
  async getRepoSettings(@TbAccessToken() accessToken: string) {
    const query = new FetchRepoSettingsQuery(accessToken);
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/repositorySettings/checkAccess')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check repository access',
    description:
      'Check if the repository is accessible with the given credentials',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access check result',
  })
  async checkRepoAccess(
    @TbAccessToken() accessToken: string,
    @Body() payload: any,
  ) {
    const command = new CheckRepoAccessCommand(accessToken, payload);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/repositorySettings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save repository settings',
    description: 'Save version control repository settings',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Repository settings saved',
  })
  async saveRepoSettings(
    @TbAccessToken() accessToken: string,
    @Body() payload: any,
  ) {
    const command = new SaveRepoSettingsCommand(accessToken, payload);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entities/vc/versions')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get versions',
    description: 'Retrieve paginated list of version control versions',
  })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'sortProperty', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiQuery({ name: 'branch', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Versions retrieved successfully',
  })
  async getVersions(
    @TbAccessToken() accessToken: string,
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('branch') branch?: string,
  ) {
    const query = new FetchVersionsQuery(
      accessToken,
      page ? parseInt(page, 10) : 0,
      pageSize ? parseInt(pageSize, 10) : 10,
      sortProperty || 'timestamp',
      sortOrder || 'DESC',
      branch || 'main',
    );
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entities/vc/versions/:entityType/:entityId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get entity versions',
    description:
      'Retrieve paginated list of version control versions for a specific entity',
  })
  @ApiParam({ name: 'entityType', required: true, type: String })
  @ApiParam({ name: 'entityId', required: true, type: String })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'sortProperty', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiQuery({ name: 'branch', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Entity versions retrieved successfully',
  })
  async getEntityVersions(
    @TbAccessToken() accessToken: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('branch') branch?: string,
  ) {
    const query = new FetchVersionsQuery(
      accessToken,
      page ? parseInt(page, 10) : 0,
      pageSize ? parseInt(pageSize, 10) : 10,
      sortProperty || 'timestamp',
      sortOrder || 'DESC',
      branch || 'main',
      entityType,
      entityId,
    );
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entities/vc/diff/:entityType/:entityId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get entity version diff',
    description: 'Retrieve difference between current and a specific version',
  })
  @ApiParam({ name: 'entityType', required: true, type: String })
  @ApiParam({ name: 'entityId', required: true, type: String })
  @ApiQuery({ name: 'versionId', required: true, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Version difference retrieved successfully',
  })
  async getEntityVersionDiff(
    @TbAccessToken() accessToken: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('versionId') versionId: string,
  ) {
    const query = new FetchVersionDiffQuery(
      accessToken,
      entityType,
      entityId,
      versionId,
    );
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/repositorySettings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete repository settings',
    description: 'Delete current version control repository settings',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Repository settings deleted successfully',
  })
  async deleteRepoSettings(@TbAccessToken() accessToken: string) {
    const command = new DeleteRepoSettingsCommand(accessToken);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entities/vc/branches')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get repository branches',
    description: 'Retrieve list of branches for the configured repository',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Branches retrieved successfully',
  })
  async getBranches(@TbAccessToken() accessToken: string) {
    const query = new FetchBranchesQuery(accessToken);
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  // Trendz endpoints
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/trendz/settings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Trendz settings',
    description: 'Retrieve Trendz integration settings',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trendz settings retrieved',
  })
  async getTrendzSettings(@TbAccessToken() accessToken: string) {
    const query = new FetchTrendzSettingsQuery(accessToken);
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/trendz/settings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save Trendz settings',
    description: 'Save Trendz integration settings',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Trendz settings saved' })
  async saveTrendzSettings(
    @TbAccessToken() accessToken: string,
    @Body() body: { enabled: boolean; baseUrl: string; apiKey: string },
  ) {
    const command = new SaveTrendzSettingsCommand(accessToken, body);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  // AI Model endpoints
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/ai/model')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get AI models',
    description: 'Get paginated list of AI models',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'AI models retrieved' })
  async getAiModels(
    @TbAccessToken() accessToken: string,
    @Query('page') page: number = 0,
    @Query('pageSize') pageSize: number = 10,
    @Query('sortProperty') sortProperty: string = 'createdTime',
    @Query('sortOrder') sortOrder: string = 'DESC',
  ) {
    const query = new FetchAiModelsQuery(
      accessToken,
      page,
      pageSize,
      sortProperty,
      sortOrder,
    );
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/ai/model')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save AI model',
    description: 'Create or update an AI model',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'AI model saved' })
  async saveAiModel(@TbAccessToken() accessToken: string, @Body() body: any) {
    const command = new SaveAiModelCommand(accessToken, body);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/ai/model/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete AI model',
    description: 'Delete an AI model by ID',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'AI model deleted' })
  async deleteAiModel(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    const command = new DeleteAiModelCommand(accessToken, id);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/ai/model/chat')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check AI model connectivity',
    description: 'Test connectivity of an AI model configuration',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connectivity check result',
  })
  async checkAiModelConnectivity(
    @TbAccessToken() accessToken: string,
    @Body() body: any,
  ) {
    const command = new CheckAiModelConnectivityCommand(accessToken, body);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  // Auto-commit settings endpoints
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/autoCommitSettings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get auto-commit settings',
    description: 'Get auto-commit settings configuration',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auto-commit settings retrieved',
  })
  async getAutoCommitSettings(@TbAccessToken() accessToken: string) {
    const query = new FetchAutoCommitSettingsQuery(accessToken);
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/autoCommitSettings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save auto-commit settings',
    description: 'Save auto-commit settings configuration',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auto-commit settings saved',
  })
  async saveAutoCommitSettings(
    @TbAccessToken() accessToken: string,
    @Body() body: any,
  ) {
    const command = new SaveAutoCommitSettingsCommand(accessToken, body);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/autoCommitSettings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete auto-commit settings',
    description: 'Delete auto-commit settings configuration',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auto-commit settings deleted',
  })
  async deleteAutoCommitSettings(@TbAccessToken() accessToken: string) {
    const command = new DeleteAutoCommitSettingsCommand(accessToken);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  // Version creation & entity listing endpoints
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/entities/vc/version')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create entities version',
    description: 'Create a new version of selected entities',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Version creation request ID returned',
  })
  async createVersion(@TbAccessToken() accessToken: string, @Body() body: any) {
    const command = new CreateVersionCommand(accessToken, body);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entities/vc/version/:requestId/status')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get version creation status',
    description: 'Poll for version creation status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Version creation status',
  })
  async getVersionCreationStatus(
    @TbAccessToken() accessToken: string,
    @Param('requestId') requestId: string,
  ) {
    const query = new FetchVersionCreationStatusQuery(accessToken, requestId);
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entities/byType/:entityType')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get entities by type',
    description: 'List entities of a specific type',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Entities list' })
  async getEntitiesByType(
    @TbAccessToken() accessToken: string,
    @Param('entityType') entityType: string,
    @Query('page') page: string = '0',
    @Query('pageSize') pageSize: string = '50',
  ) {
    const query = new FetchEntitiesByTypeQuery(
      accessToken,
      entityType,
      parseInt(page, 10),
      parseInt(pageSize, 10),
    );
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entities/:entityType/:id/keys')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get keys for single entity',
    description:
      'Retrieve telemetry or attribute keys for a specific entity using entitiesQuery/find/keys',
  })
  async getKeysBySingleEntity(
    @TbAccessToken() accessToken: string,
    @Param('entityType') entityTypeParam: string,
    @Param('id') id: string,
    @Query('kind') kindParam?: string,
    @Query('scope') scopeParam?: string,
  ) {
    const entityType = entityTypeParam.toUpperCase();
    const kind = (kindParam || 'latest_telemetry').toLowerCase();
    const scope = (scopeParam || 'SERVER_SCOPE').toUpperCase() as any;

    const supportedEntityTypes = new Set([
      'DEVICE',
      'ASSET',
      'CUSTOMER',
      'TENANT',
      'ENTITY_VIEW',
    ]);

    if (!supportedEntityTypes.has(entityType)) {
      throw new BadRequestException('Unsupported entity type');
    }

    if (kind !== 'latest_telemetry' && kind !== 'attribute') {
      throw new BadRequestException('Invalid kind value');
    }

    if (
      scope !== 'SERVER_SCOPE' &&
      scope !== 'CLIENT_SCOPE' &&
      scope !== 'SHARED_SCOPE'
    ) {
      throw new BadRequestException('Invalid scope value');
    }

    return this.thingsboardApi.fetchEntityKeysBySingleEntity(
      accessToken,
      entityType,
      id,
      {
        attributes: kind === 'attribute',
        timeseries: kind === 'latest_telemetry',
        ...(kind === 'attribute' ? { scope } : {}),
      },
    );
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/entities/vc/entity')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Restore version entities',
    description: 'Restores selected entities from a version',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Version restoration request ID',
  })
  async restoreVersion(
    @TbAccessToken() accessToken: string,
    @Body() payload: any,
  ) {
    const command = new RestoreVersionCommand(accessToken, payload);
    const result: Result<string, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (requestId: string) => requestId,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entities/vc/entity/:requestId/status')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get restore version status',
    description: 'Poll for version restoration status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Version restoration status',
  })
  async getRestoreVersionStatus(
    @TbAccessToken() accessToken: string,
    @Param('requestId') requestId: string,
  ) {
    const query = new FetchRestoreVersionStatusQuery(accessToken, requestId);
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/audit/logs')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get audit logs',
    description: 'Fetch paginated audit logs',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audit logs page' })
  async getAuditLogs(
    @TbAccessToken() accessToken: string,
    @Query('pageSize') pageSize: string = '10',
    @Query('page') page: string = '0',
    @Query('sortProperty') sortProperty: string = 'createdTime',
    @Query('sortOrder') sortOrder: string = 'DESC',
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    const query = new FetchAuditLogsQuery(accessToken, {
      pageSize: parseInt(pageSize, 10),
      page: parseInt(page, 10),
      sortProperty,
      sortOrder,
      startTime: parseInt(startTime, 10),
      endTime: parseInt(endTime, 10),
    });
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/oauth2/domain/infos')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get domain infos' })
  @ApiResponse({ status: HttpStatus.OK })
  async getDomainInfos(
    @TbAccessToken() accessToken: string,
    @Query('pageSize') pageSize: string = '10',
    @Query('page') page: string = '0',
    @Query('sortProperty') sortProperty: string = 'createdTime',
    @Query('sortOrder') sortOrder: string = 'DESC',
  ) {
    const query = new FetchDomainInfosQuery(accessToken, {
      pageSize: parseInt(pageSize, 10),
      page: parseInt(page, 10),
      sortProperty,
      sortOrder,
    });
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/oauth2/client/infos')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get OAuth2 client infos' })
  @ApiResponse({ status: HttpStatus.OK })
  async getOAuth2ClientInfos(
    @TbAccessToken() accessToken: string,
    @Query('pageSize') pageSize: string = '50',
    @Query('page') page: string = '0',
    @Query('sortProperty') sortProperty: string = 'title',
    @Query('sortOrder') sortOrder: string = 'ASC',
  ) {
    const query = new FetchOAuth2ClientInfosQuery(accessToken, {
      pageSize: parseInt(pageSize, 10),
      page: parseInt(page, 10),
      sortProperty,
      sortOrder,
    });
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/oauth2/domain')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a domain' })
  @ApiResponse({ status: HttpStatus.OK })
  async createDomain(
    @TbAccessToken() accessToken: string,
    @Query('oauth2ClientIds') oauth2ClientIds: string = '',
    @Body()
    payload: { name: string; oauth2Enabled: boolean; propagateToEdge: boolean },
  ) {
    const ids = oauth2ClientIds
      ? oauth2ClientIds.split(',').filter(Boolean)
      : [];
    const command = new CreateDomainCommand(accessToken, payload, ids);
    const result: Result<any, ThingsboardApiException> =
      await this.commandBus.execute(command);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/oauth2/domain/info/:domainId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get domain by id' })
  @ApiResponse({ status: HttpStatus.OK })
  async getDomainById(
    @TbAccessToken() accessToken: string,
    @Param('domainId') domainId: string,
  ) {
    const query = new FetchDomainByIdQuery(accessToken, domainId);
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/oauth2/domain/:domainId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a domain' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateDomain(
    @TbAccessToken() accessToken: string,
    @Param('domainId') domainId: string,
    @Query('oauth2ClientIds') oauth2ClientIds: string = '',
    @Body()
    payload: { name: string; oauth2Enabled: boolean; propagateToEdge: boolean },
  ) {
    const ids = oauth2ClientIds
      ? oauth2ClientIds.split(',').filter(Boolean)
      : [];
    const command = new UpdateDomainCommand(
      accessToken,
      domainId,
      payload,
      ids,
    );
    const result: Result<any, ThingsboardApiException> =
      await this.commandBus.execute(command);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/oauth2/config/template')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get OAuth2 config templates' })
  @ApiResponse({ status: HttpStatus.OK })
  async getOAuth2ConfigTemplate(@TbAccessToken() accessToken: string) {
    const query = new FetchOAuth2ConfigTemplateQuery(accessToken);
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/oauth2/client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save an OAuth2 client' })
  @ApiResponse({ status: HttpStatus.OK })
  async saveOAuth2Client(
    @TbAccessToken() accessToken: string,
    @Body() payload: any,
  ) {
    const command = new SaveOAuth2ClientCommand(accessToken, payload);
    const result: Result<any, ThingsboardApiException> =
      await this.commandBus.execute(command);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/oauth2/client/:clientId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get OAuth2 client by id' })
  @ApiResponse({ status: HttpStatus.OK })
  async getOAuth2ClientById(
    @TbAccessToken() accessToken: string,
    @Param('clientId') clientId: string,
  ) {
    const query = new FetchOAuth2ClientByIdQuery(accessToken, clientId);
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of rule chains' })
  async getRuleChains(
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('type') type?: 'CORE' | 'EDGE',
  ) {
    const query = new FetchRuleChainsQuery(
      accessToken,
      Number(page),
      Number(pageSize),
      type,
      sortProperty,
      sortOrder,
    );
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/ruleChain/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get rule chain by id' })
  async getRuleChain(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    const query = new FetchRuleChainByIdQuery(accessToken, id);
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/rule-chains/:id/metadata')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get rule chain metadata by id' })
  async getRuleChainMetadata(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    const query = new FetchRuleChainMetadataQuery(accessToken, id);
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/rule-chains')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create/Update rule chain' })
  async createRuleChainFull(
    @TbAccessToken() accessToken: string,
    @Body() payload: any,
  ) {
    const command = new CreateRuleChainFullCommand(accessToken, payload);
    const result: Result<any, ThingsboardApiException> =
      await this.commandBus.execute(command);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/rule-chains/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete rule chain' })
  async deleteRuleChain(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    const command = new DeleteRuleChainCommand(accessToken, id);
    const result: Result<any, ThingsboardApiException> =
      await this.commandBus.execute(command);
    return match(result, {
      Ok: () => ({ success: true }),
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/rule-chains/:id/root')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set rule chain as root' })
  async setRootRuleChain(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    const command = new SetRootRuleChainCommand(accessToken, id);
    const result: Result<any, ThingsboardApiException> =
      await this.commandBus.execute(command);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/rule-chains/metadata')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save rule chain metadata (nodes + connections)' })
  async saveRuleChainMetadata(
    @TbAccessToken() accessToken: string,
    @Body()
    body: {
      ruleChainId: { entityType: string; id: string };
      nodes: any[];
      connections: any[];
      firstNodeIndex?: number;
      version?: number;
    },
  ) {
    const { ruleChainId, ...metadata } = body;
    const command = new SaveRuleChainMetadataCommand(
      accessToken,
      ruleChainId,
      metadata,
    );
    const result: Result<any, ThingsboardApiException> =
      await this.commandBus.execute(command);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/events/:entityType/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get entity events by query' })
  async getEntityEventsByQuery(
    @TbAccessToken() accessToken: string,
    @Param('entityType') entityType: string,
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Body('eventType') eventType: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('startTime') startTime?: number,
    @Query('endTime') endTime?: number,
  ) {
    const query = new FetchEntityEventsQuery(
      accessToken,
      entityType,
      id,
      tenantId,
      eventType,
      Number(page),
      Number(pageSize),
      sortProperty,
      sortOrder,
      startTime ? Number(startTime) : undefined,
      endTime ? Number(endTime) : undefined,
    );
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);
    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  // Proxied Rule Chain Detail Endpoints


  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/entities/vc/info/:versionId/:entityType/:entityId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get version entity info',
    description: 'Retrieve information about an entity in a specific version',
  })
  async getVersionEntityInfo(
    @TbAccessToken() accessToken: string,
    @Param('versionId') versionId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return await this.thingsboardApi.getVersionEntityInfo(
      accessToken,
      versionId,
      entityType,
      entityId,
    );
  }

  // Dashboards

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/tenant/dashboards')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get tenant dashboards',
    description: 'Fetch dashboards for current tenant',
  })
  async getTenantDashboards(
    @TbAccessToken() accessToken: string,
    @Query('pageSize') pageSize: string = '10',
    @Query('page') page: string = '0',
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return await this.thingsboardApi.fetchTenantDashboards(
      accessToken,
      parseInt(pageSize),
      parseInt(page),
      sortProperty,
      sortOrder,
    );
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/dashboard/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get dashboard by ID',
    description: 'Fetch dashboard details by ID',
  })
  async getDashboardById(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('includeResources') includeResources?: string,
  ) {
    return await this.thingsboardApi.fetchDashboardById(
      accessToken,
      id,
      includeResources === 'true',
    );
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/customer/public/dashboard/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Make dashboard public',
    description: 'Assign dashboard to the public customer',
  })
  async makeDashboardCustomerPublic(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    return await this.thingsboardApi.makeDashboardCustomerPublic(
      accessToken,
      id,
    );
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/customer/public/dashboard/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Make dashboard private',
    description: 'Unassign dashboard from the public customer',
  })
  async makeDashboardCustomerPrivate(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    return await this.thingsboardApi.makeDashboardCustomerPrivate(
      accessToken,
      id,
    );
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/customer/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get customer by ID',
    description: 'Retrieve details for a specific customer',
  })
  async getCustomerById(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    return await this.thingsboardApi.fetchCustomerById(accessToken, id);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/dashboard')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save dashboard',
    description: 'Create or update a dashboard in ThingsBoard',
  })
  async saveDashboard(
    @TbAccessToken() accessToken: string,
    @Body() dashboard: any,
  ) {
    try {
      return await this.thingsboardApi.saveDashboard(accessToken, dashboard);
    } catch (error) {
      throw new InternalServerErrorException('Failed to save dashboard');
    }
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/dashboard/:id/customers')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update dashboard customers',
    description: 'Assign or unassign customers to a dashboard',
  })
  async updateDashboardCustomers(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body() customerIds: string[],
  ) {
    return await this.thingsboardApi.updateDashboardCustomers(
      accessToken,
      id,
      customerIds,
    );
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/dashboard/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete dashboard',
    description: 'Delete a specific dashboard from ThingsBoard',
  })
  async deleteDashboard(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    return await this.thingsboardApi.deleteDashboard(accessToken, id);
  }

  @Roles(Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/dashboards/:id/audit-logs')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get dashboard audit logs',
    description: 'Retrieve paginated audit logs for a specific dashboard',
  })
  async getDashboardAuditLogs(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const start = startTime ? parseInt(startTime, 10) : undefined;
    const end = endTime ? parseInt(endTime, 10) : undefined;

    return await this.thingsboardApi.fetchDashboardAuditLogs(
      accessToken,
      id,
      Number(page),
      Number(pageSize),
      sortProperty,
      sortOrder,
      start,
      end,
    );
  }
}
