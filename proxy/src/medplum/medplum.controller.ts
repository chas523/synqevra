import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MedplumService } from './medplum.service';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { CurrentUser } from '../auth/types/current-user';
import { MedplumConnectionService } from '../connection/medplum-connection.service';
import type { Observation, Patient } from '@medplum/fhirtypes';

@Controller('medplum')
export class MedplumController {
  constructor(
    private readonly medplumService: MedplumService,
    private readonly medplumConnectionService: MedplumConnectionService,
  ) {}

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

  @Get('patient/:id')
  async getPatient(@Param('id') id: string, @ActiveUser() user: CurrentUser) {
    return this.medplumService.getPatientById(id, user.id);
  }

  @Put('patient/:id')
  async updatePatient(
    @Param('id') id: string,
    @Body() patientDto: Patient,
    @ActiveUser() user: CurrentUser,
  ) {
    return this.medplumService.updatePatient(id, patientDto, user.id);
  }

  @Post('patient')
  async createPatient(
    @Body() patientDto: Patient,
    @ActiveUser() user: CurrentUser,
  ) {
    return this.medplumService.createPatient(patientDto, user.id);
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

  @Get('patient/:id/observations')
  async getPatientObservations(
    @ActiveUser() user: CurrentUser,
    @Param('id') id: string,
    @Query('count') count?: number,
  ): Promise<Observation[]> {
    return this.medplumService.getPatientObservations(id, count, user.id);
  }
}
