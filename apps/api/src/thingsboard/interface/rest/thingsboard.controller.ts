import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Query,
  Param,
  Put,
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
} from '@nestjs/swagger';
import { ThingsboardAuthGuard } from 'src/auth/guards/thingsboard-auth/thingsboard-auth.guard';
import { TbAccessToken } from 'src/auth/decorators/tb-access-token.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FetchDevicesQuery } from 'src/thingsboard/application/queries/fetch-devices/fetch-devices.query';
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
import { TelemetryService } from 'src/thingsboard/application/services/telemetry.service';
import { DashboardQueries } from 'src/thingsboard/application/services/dashboard-queries';

@ApiTags('ThingsBoard')
@Controller('thingsboard')
export class ThingsboardController {
  private readonly logger = new Logger(ThingsboardController.name);
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly telemetryService: TelemetryService,
  ) {}

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

  //simulate frontend websocket continous connection for x minutes
  @Public()
  @Get('/websocket/demo')
  @ApiOperation({
    summary: 'Demo WebSocket - 5 minut ciągłego nasłuchiwania',
    description:
      'Symuluje frontend: łączy się z WebSocket, wysyła zapytania i loguje WSZYSTKIE przychodzące wiadomości przez 5 minut.',
  })
  async websocketDemo() {
    const DEMO_DURATION_MS = 5 * 60 * 1100; // 5 minut
    const startTime = Date.now();
    let messageCount = 0;

    console.log('='.repeat(60));
    console.log('🚀 DEMO START - Ciągłe nasłuchiwanie przez 5 minut');
    console.log('='.repeat(60));

    // 1. Ustaw handler - KAŻDA wiadomość będzie logowana
    this.telemetryService.setMessageHandler((msg) => {
      messageCount++;
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`\n📨 [${elapsed}s] Wiadomość #${messageCount}:`);
      console.log(`   cmdId: ${msg.cmdId}`);
      console.log(`   type: ${msg.cmdUpdateType}`);
      this.logger.log(msg);
      // if (msg.data) {
      //   console.log(`   data: ${JSON.stringify(msg.data)}...`);
      // }
      // if (msg.update) {
      //   console.log(`   update: ${JSON.stringify(msg.update)}...`);
      // }
      if (msg.errorCode !== 0) {
        console.log(`   ❌ ERROR: ${msg.errorMsg}`);
      }
    });

    // 2. Połącz jako sysadmin
    await this.telemetryService.connectAsSysadmin();
    console.log('✅ Połączono z WebSocket');

    // 3. Wyślij zapytania - entity counts
    const countCommands = DashboardQueries.allEntityCounts();
    this.telemetryService.sendCommands(countCommands);
    console.log(`📤 Wysłano ${countCommands.length} entity count komend`);

    // 4. Wyślij złożone zapytanie (query + tsCmd)
    // const [queryCmd, tsCmd] = DashboardQueries.systemMetricsWithTimeseries(10);
    // this.telemetryService.sendCommands([queryCmd]);
    // console.log('📤 Wysłano query dla system metrics (cmdId: 10)');

    // Poczekaj chwilę i wyślij tsCmd
    // await this.delay(500);
    // this.telemetryService.sendCommands([tsCmd]);
    // console.log('📤 Wysłano tsCmd dla system metrics (cmdId: 10)');

    // 5. Symulacja frontendu - czekaj 5 minut, nowe wiadomości będą logowane
    console.log(
      `\n⏳ Nasłuchiwanie przez ${DEMO_DURATION_MS / 1000} sekund...`,
    );
    console.log('   (Wszystkie przychodzące wiadomości będą logowane)\n');

    await this.delay(DEMO_DURATION_MS);

    // 6. Zakończ
    this.telemetryService.disconnect();

    const summary = {
      durationSeconds: DEMO_DURATION_MS / 1000,
      totalMessages: messageCount,
      status: 'completed',
    };

    console.log('\n' + '='.repeat(60));
    console.log('🏁 DEMO ZAKOŃCZONE');
    console.log(`   Czas: ${summary.durationSeconds}s`);
    console.log(`   Wiadomości: ${summary.totalMessages}`);
    console.log('='.repeat(60));

    return summary;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
