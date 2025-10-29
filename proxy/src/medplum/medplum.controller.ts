import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MedplumService } from './medplum.service';
import { CreateProjectDto } from './dtos/createProjectDto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { CurrentUser } from '../auth/types/current-user';
import type { Patient } from '@medplum/fhirtypes';

@Controller('medplum')
export class MedplumController {
  constructor(private readonly medplumService: MedplumService) {}

  //not used since we're using medplumService.create in another function
  // @Post('connect')
  // async connect(
  //   @Body() dto: CreateProjectDto,
  //   @ActiveUser() user: CurrentUser,
  // ) {
  //   return this.medplumService.create(dto, user);
  @Get('device/:deviceId')
  async getDevice(@Param('deviceId') deviceId: string) {
    return this.medplumService.getDevice(deviceId);
  }

  @Post('device')
  async createDevice(
    @Body() deviceDto: { identifier: string; patientRef: string },
  ) {
    return this.medplumService.createDevice(deviceDto);
  }

  @Get('patient')
  async getPatientList() {
    return this.medplumService.getPatientList();
  }

  @Post('patient')
  async createPatient(@Body() patientDto: Patient) {
    return this.medplumService.createPatient(patientDto);
  }

  @Post('patient/:patientId/device/:deviceId')
  async assignPatientToDevice(
    @Param('patientId') patientId: string,
    @Param('deviceId') deviceId: string,
  ) {
    return await this.medplumService.assignPatientToDevice(patientId, deviceId);
  }
}
