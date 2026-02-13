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
import { CreateWidgetTypeRequestDto, WidgetTypeDto, WidgetTypesPageDto } from './dtos/response/widget-types.response.dto';
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
import { FetchMaterialIconsQuery } from 'src/thingsboard/application/queries/fetch-material-icons/fetch-material-icons.query';
import { FetchNotificationRequestsQuery } from 'src/thingsboard/application/queries/fetch-notification-requests/fetch-notification-requests.query';


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
  async getSecuritySettings() {
    const query = new FetchSecuritySettingsQuery();
    const result: Result<SecuritySettingsDtoResponse, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (securityResponse: SecuritySettingsDtoResponse) => securityResponse,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
  async updateSecuritySettings(@Body() settings: SecuritySettingsDto) {
    const command = new UpdateSecuritySettingsCommand(settings);
    const result: Result<SecuritySettingsDtoResponse, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (securityResponse: SecuritySettingsDtoResponse) => securityResponse,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
  async getCurrentVersion() {
    const query = new FetchVersionQuery();
    const result: Result<DashboardVersionResponse, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (result: DashboardVersionResponse) => result,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
  async getGeneralSettings() {
    const query = new FetchGeneralSettingsQuery();
    const result: Result<GeneralSettingsDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (settings: GeneralSettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
  async updateGeneralSettings(@Body() settings: GeneralSettingsRequestDto) {
    const command = new UpdateGeneralSettingsCommand(settings);
    const result: Result<GeneralSettingsDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (settings: GeneralSettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
  async getConnectivitySettings() {
    const query = new FetchConnectivitySettingsQuery();
    const result: Result<ConnectivitySettingsDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (settings: ConnectivitySettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
  ) {
    const command = new UpdateConnectivitySettingsCommand(settings);
    const result: Result<ConnectivitySettingsDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (settings: ConnectivitySettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
  async getSmsSettings() {
    const query = new FetchSmsSettingsQuery();
    const result: Result<SmsSettingsDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (settings: SmsSettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
  async updateSmsSettings(@Body() settings: SmsSettingsDto) {
    const command = new UpdateSmsSettingsCommand(settings);
    const result: Result<SmsSettingsDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (settings: SmsSettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
  async getNotificationSettings() {
    const query = new FetchNotificationSettingsQuery();
    const result: Result<NotificationSettingsDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (settings: NotificationSettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
  async updateNotificationSettings(@Body() settings: NotificationSettingsDto) {
    const command = new UpdateNotificationSettingsCommand(settings);
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
  @UseGuards(JwtAuthGuard)
  @Get('queues')
  @ApiOperation({ summary: 'Fetch queues' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: QueuesPageResponseDto,
  })
  async fetchQueues(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const query = new FetchQueuesQuery(page, pageSize, sortProperty, sortOrder);
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
  @UseGuards(JwtAuthGuard)
  @Post('queues')
  @ApiOperation({ summary: 'Create or update queue' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: QueueDto,
  })
  async createQueue(@Body() queue: QueueDto) {
    const command = new CreateQueueCommand(queue);
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
  @UseGuards(JwtAuthGuard)
  @Delete('queues/:queueId')
  @ApiOperation({ summary: 'Delete queue' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  async deleteQueue(@Param('queueId') queueId: string) {
    const command = new DeleteQueueCommand(queueId);
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
  @UseGuards(JwtAuthGuard)
  @Get('resources')
  @ApiOperation({ summary: 'Fetch resources' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ResourcesPageResponseDto,
  })
  async fetchResources(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('sortProperty') sortProperty = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('resourceType') resourceType?: string,
    @Query('resourceSubType') resourceSubType?: string,
  ) {
    const query = new FetchResourcesQuery(
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
  @UseGuards(JwtAuthGuard)
  @Get('resource/info/:resourceId')
  @ApiOperation({ summary: 'Get resource info' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ResourceDto,
  })
  async getResourceInfo(@Param('resourceId') resourceId: string) {
    const query = new FetchResourceInfoQuery(resourceId);
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
  @UseGuards(JwtAuthGuard)
  @Post('resources')
  @ApiOperation({ summary: 'Create resource' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ResourceDto,
  })
  async createResource(@Body() resource: ResourceCreateDto) {
    const command = new CreateResourceCommand(resource);
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
  @UseGuards(JwtAuthGuard)
  @Delete('resources/:resourceId')
  @ApiOperation({ summary: 'Delete resource' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  async deleteResource(
    @Param('resourceId') resourceId: string,
    @Query('force') force: boolean = false,
  ) {
    const command = new DeleteResourceCommand(resourceId, force);
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
  @UseGuards(JwtAuthGuard)
  @Get('resources/:resourceId/download')
  @ApiOperation({ summary: 'Download resource' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resource file',
  })
  async downloadResource(
    @Param('resourceId') resourceId: string,
    @Res() res: any,
  ) {
    const query = new DownloadResourceQuery(resourceId);
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
  async getDeliveryMethods() {
    const query = new FetchDeliveryMethodsQuery();
    const result: Result<DeliveryMethodsResponse, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: DeliveryMethodsResponse) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
  async sendNotification(@Body() notificationRequest: SendNotificationRequestDto) {
    const command = new SendNotificationCommand(notificationRequest);
    const result: Result<NotificationRequestResponse, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: NotificationRequestResponse) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Post('notification/target')
  async createNotificationTarget(
    @Body() request: CreateNotificationTargetRequestDto,
  ) {
    const command = new CreateNotificationTargetCommand(request);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (target) => target,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Get('notification/targets')
  async fetchNotificationTargets() {
    const query = new FetchNotificationTargetsQuery();
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Post('notification/request/preview')
  async previewNotificationRequest(@Body() previewRequest: any) {
    const command = new PreviewNotificationRequestCommand(previewRequest);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Get('material-icons')
  async fetchMaterialIcons() {
    const query = new FetchMaterialIconsQuery();
    const result = await this.queryBus.execute(query);

    return match(result, {
      Ok: (icons) => icons,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const query = new FetchNotificationRequestsQuery({
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
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('notificationTypes') notificationTypes?: string,
  ) {
    const query = new FetchNotificationTemplatesQuery({
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
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const query = new FetchNotificationRulesQuery({
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
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const query = new FetchNotificationTargetsQuery({
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
  ) {
    const command = new CreateNotificationTemplateCommand(templateData);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
  ) {
    const command = new CreateNotificationRuleCommand(rule);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (response) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  // Image endpoints
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('images')
  @ApiOperation({ summary: 'Get images' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'sortProperty', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'imageSubType', required: false, type: String })
  @ApiQuery({ name: 'includeSystemImages', required: false, type: Boolean })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ImagesPageResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getImages(
    @Query('page') page: number = 0,
    @Query('pageSize') pageSize: number = 10,
    @Query('sortProperty') sortProperty: string = 'createdTime',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('imageSubType') imageSubType: string = 'IMAGE',
    @Query('includeSystemImages') includeSystemImages: boolean = false,
  ) {
    const query = new FetchImagesQuery(
      page,
      pageSize,
      sortProperty,
      sortOrder,
      imageSubType,
      includeSystemImages,
    );
    const result: Result<ImagesPageResponseDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: ImagesPageResponseDto) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('images')
  @ApiOperation({ summary: 'Upload image' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ImageDto,
  })
  async uploadImage(
    @Body() body: { file: string; fileName: string; title: string; imageSubType?: string },
  ) {
    // Convert base64 file to Buffer
    const fileBuffer = Buffer.from(body.file, 'base64');
    const command = new UploadImageCommand(
      fileBuffer,
      body.fileName,
      body.title,
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
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Get('images/download/:encodedLink')
  @ApiOperation({ summary: 'Download image' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image file',
  })
  async downloadImage(
    @Param('encodedLink') encodedLink: string,
    @Res() res: any,
  ) {
    const imageLink = decodeURIComponent(encodedLink);
    const query = new DownloadImageQuery(imageLink);
    const result: Result<Buffer, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (buffer: Buffer) => {
        let contentType = 'application/octet-stream';

        // Infer content type for SVGs to ensure proper rendering
        if (imageLink.toLowerCase().includes('.svg') || buffer.slice(0, 100).toString().toLowerCase().includes('<svg')) {
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

  @Get('admin/settings/mail')
  @ApiOperation({ summary: 'Get mail settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mail settings',
    type: MailSettingsDto,
  })
  async fetchMailSettings() {
    const query = new FetchMailSettingsQuery();
    const result: Result<MailSettingsDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (settings: MailSettingsDto) => settings,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @Post('admin/settings/mail')
  @ApiOperation({ summary: 'Update mail settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated mail settings',
    type: MailSettingsDto,
  })
  async updateMailSettings(@Body() settings: MailSettingsDto) {
    const command = new UpdateMailSettingsCommand(settings);
    const result: Result<MailSettingsDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (updated: MailSettingsDto) => updated,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('images/export/:encodedLink')
  @ApiOperation({ summary: 'Export image to JSON' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ImageExportDto,
  })
  async exportImage(
    @Param('encodedLink') encodedLink: string,
  ) {
    const imageLink = decodeURIComponent(encodedLink);
    const query = new ExportImageQuery(imageLink);
    const result: Result<ImageExportDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: ImageExportDto) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('images/:encodedLink')
  @ApiOperation({ summary: 'Delete image' })
  @ApiQuery({ name: 'force', required: false, type: Boolean })
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteImageResponseDto,
  })
  async deleteImage(
    @Param('encodedLink') encodedLink: string,
    @Query('force') force: boolean = false,
  ) {
    const imageLink = decodeURIComponent(encodedLink);
    const command = new DeleteImageCommand(imageLink, force);
    const result: Result<DeleteImageResponseDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: DeleteImageResponseDto) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
  async getWidgetTypeById(@Param('id') id: string) {
    const query = new FetchWidgetTypeByIdQuery(id);
    const result: Result<WidgetTypeDto, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (widgetType: WidgetTypeDto) => widgetType,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
  async deleteWidgetType(@Param('id') id: string) {
    const command = new DeleteWidgetTypeCommand(id);
    const result: Result<void, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: () => ({ success: true }),
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
    @Query('updateExistingByFqn') updateExistingByFqn: boolean = false,
  ) {
    const command = new SaveWidgetTypeCommand(widgetType, updateExistingByFqn);
    const result: Result<WidgetTypeDto, ThingsboardApiException> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (response: WidgetTypeDto) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }

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
    @Query('includeResources') includeResources: boolean = false,
  ) {
    const query = new DownloadWidgetTypeQuery(id, includeResources);
    const result: Result<any, ThingsboardApiException> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (response: any) => response,
      Err: (error: ThingsboardApiException) => {
        throw error;
      },
    });
  }
}

