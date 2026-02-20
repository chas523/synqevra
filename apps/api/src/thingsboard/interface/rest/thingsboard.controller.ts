import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Query,
  Param,
  Put,
  Delete, // Added Delete
  Res,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { ThingsboardAuthGuard } from 'src/auth/guards/thingsboard-auth/thingsboard-auth.guard';
import { TbAccessToken } from 'src/auth/decorators/tb-access-token.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';

import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FetchDevicesQuery } from 'src/thingsboard/application/queries/fetch-devices/fetch-devices.query';
import { FetchResourcesQuery } from 'src/thingsboard/application/queries/fetch-resources/fetch-resources.query';
import { FetchResourceInfoQuery } from 'src/thingsboard/application/queries/fetch-resource-info/fetch-resource-info.query';
import { match, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { FetchDeviceByIdQuery } from 'src/thingsboard/application/queries/fetch-device-by-id/fetch-device-by-id.query';
import { DeviceDetails } from './dtos/response/thingsboard-device.response.dto';

import {
  CreateDeviceCommand,
  CreateDeviceErrors,
} from 'src/thingsboard/application/commands/create-device/create-device.command';
import { Device } from './dtos/response/thingsboard-created-device.response.dto';
import type { CurrentUser } from 'src/auth/types/current-user';
import { CreateDeviceRequest } from './dtos/request/thingsboard-device.request.dto';
import { CreateNotificationTemplateRequestDto } from './dtos/request/create-notification-template.request.dto';
import { CreateNotificationRuleRequestDto } from './dtos/request/create-notification-rule.request.dto';
import { CreateNotificationRuleCommand } from '../../application/commands/create-notification-rule/create-notification-rule.command';
import { CreateNotificationTemplateCommand } from '../../application/commands/create-notification-template/create-notification-template.command';
import { NotificationTemplateDto } from './dtos/response/notification-template.response.dto';
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
import { FetchDeviceSharedAttributesQuery } from 'src/thingsboard/application/queries/fetch-device-shared-attributes/fetch-device-shared-attributes.query';
import { DeviceAttributes } from './dtos/response/thingsboard-device-attributes.response.dto';
import { UpdateDeviceSharedAttributesCommand } from 'src/thingsboard/application/commands/update-device-shared-attributes/update-device-shared-attributes.command';
import { DevicesResponse } from './dtos/response/thingsboard-devices.response.dto';
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

@ApiTags('ThingsBoard')
@Controller('thingsboard')
export class ThingsboardController {
  private readonly logger = new Logger(ThingsboardController.name);
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

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
  ) {
    const query = new FetchDevicesQuery({
      accessToken,
      page: Number(page),
      pageSize: Number(pageSize),
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
  ) {
    const query = new FetchDeviceSharedAttributesQuery(accessToken, id);
    const result: Result<DeviceAttributes, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (attributes: DeviceAttributes) => attributes,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
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
  ) {
    const command = new UpdateDeviceSharedAttributesCommand(
      accessToken,
      id,
      attributes,
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
    const command = new UpdateConnectivitySettingsCommand(settings, accessToken);
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

  @Roles(Role.ADMIN)
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

  @Roles(Role.ADMIN)
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
    const command = new UpdateNotificationSettingsCommand(settings, accessToken);
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
  @Roles(Role.ADMIN)
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
    const command = new SendNotificationCommand(accessToken, notificationRequest);
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
    const result = await this.commandBus.execute(command);

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
      accessToken
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
    const query = new DownloadWidgetTypeQuery(id, accessToken, includeResources);
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
    const result = await this.queryBus.execute(query);

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
    const result = await this.commandBus.execute(command);

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
}
