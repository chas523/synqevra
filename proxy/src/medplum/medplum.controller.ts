import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MedplumService } from './medplum.service';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { CurrentUser } from '../auth/types/current-user';
import { MedplumConnectionService } from '../connection/medplum-connection.service';

@Controller('medplum')
export class MedplumController {
  constructor(
    private readonly medplumService: MedplumService,
    private readonly medplumConnectionService: MedplumConnectionService,
  ) {}

  //not used since we're using medplumService.create in another function
  // @Post('connect')
  // async connect(
  //   @Body() dto: CreateProjectDto,
  //   @ActiveUser() user: CurrentUser,
  // ) {
  //   return this.medplumService.create(dto, user);
  @Get('device/:deviceId')
  async getDevice(
    @Param('deviceId') deviceId: string,
    @ActiveUser() user: CurrentUser,
  ) {
    const client = await this.medplumConnectionService.initMedplum(user.id);
    return this.medplumService.getDevice(deviceId, client);
  }

  @Post('device')
  async createDevice(
    @Body() deviceDto: { identifier: string; patientRef: string },
    @ActiveUser() user: CurrentUser,
  ) {
    return this.medplumService.createDevice(deviceDto, user.id);
  }

  @Get('patient')
  async getPatientList(@ActiveUser() user: CurrentUser) {
    return this.medplumService.getPatientList(user.id);
  }

  @Post('patient/:patientId/device/:deviceId')
  async assignPatientToDevice(
    @Param('patientId') patientId: string,
    @Param('deviceId') deviceId: string,
    @ActiveUser() user: CurrentUser,
  ) {
    return await this.medplumService.assignPatientToDevice(
      patientId,
      deviceId,
      user.id,
    );
  }
}
