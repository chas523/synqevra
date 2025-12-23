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
} from '@nestjs/common';
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
import type { CreateDeviceRequest } from './dtos/request/thingsboard-device.request.dto';
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

@Controller('thingsboard')
export class ThingsboardController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Post('/login')
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
}
