import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Query,
  Param,
  Put,
} from '@nestjs/common';
import { ThingsboardService } from './thingsboard.service';
import { ThingsboardAuthGuard } from 'src/auth/guards/thingsboard-auth/thingsboard-auth.guard';
import { TbAccessToken } from 'src/auth/decorators/tb-access-token.decorator';
import { ThingsboardDeviceService } from './services/thingsboard-device.service';
import type { CreateDeviceRequest } from './thingsboard.types';
import type { CurrentUser } from '../auth/types/current-user';
import { ActiveUser } from '../auth/decorators/active-user.decorator';

@Controller('thingsboard')
@UseGuards(ThingsboardAuthGuard)
export class ThingsboardController {
  constructor(
    private readonly thingsboardService: ThingsboardService,
    private readonly deviceService: ThingsboardDeviceService,
  ) {}

  //not used since we're using thingsboardService.connectRegisterToThingsboard in another function
  // @Post('/connect/register')
  // async connectRegisterToThingsboard(
  //   @Body() formData: ThingsboardConnectionFormDto,
  // ) {
  //   return await this.thingsboardService.connectRegisterToThingsboard(formData);
  // }
  //@Public()
  @Get('/')
  async getRoot(@TbAccessToken() accessToken: string) {
    return await this.thingsboardService.getUser(accessToken);
  }

  @Get('/devices')
  async getDevices(
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
  ) {
    return await this.deviceService.fetchDevices(accessToken, page, pageSize);
  }

  @Get('/devices/:id')
  async getDevice(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    return await this.deviceService.fetchDevice(accessToken, id);
  }

  @Post('/devices')
  async createDevice(
    @TbAccessToken() accessToken: string,
    @Body() payload: CreateDeviceRequest,
    @ActiveUser() user: CurrentUser,
  ) {
    return await this.deviceService.createDevice(accessToken, payload, user.id);
  }

  @Get('/devices/:id/attributes')
  async getDeviceAttributes(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
  ) {
    return await this.deviceService.fetchDeviceSharedAttributes(
      accessToken,
      id,
    );
  }

  @Put('/devices/:id/attributes')
  async updateDeviceAttributes(
    @TbAccessToken() accessToken: string,
    @Param('id') id: string,
    @Body() attributes: Record<string, any>,
  ) {
    await this.deviceService.updateDeviceSharedAttributes(
      accessToken,
      id,
      attributes,
    );
    return { success: true };
  }
}
