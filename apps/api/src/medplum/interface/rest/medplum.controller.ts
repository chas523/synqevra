import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ActiveUser } from '../../../auth/decorators/active-user.decorator';
import type { CurrentUser } from '../../../auth/types/current-user';
import type { Observation, Patient, Practitioner } from '@medplum/fhirtypes';
import { DeviceUseCase } from '../../application/use-cases/device.use-case';
import { PatientUseCase } from '../../application/use-cases/patient.use-case';
import { GetPractitionerByIdUseCase } from '../../application/use-cases/get-practitioner-by-id.use-case';
import { GetPractitionerListUseCase } from 'src/medplum/application/use-cases/get-practitioner-list.use-case';

@Controller('medplum')
export class MedplumController {
  constructor(
    private readonly deviceUseCase: DeviceUseCase,
    private readonly patientUseCase: PatientUseCase,
    private readonly getPractitionerListUseCase: GetPractitionerListUseCase,
    private readonly getPractitionerByIdUseCase: GetPractitionerByIdUseCase,
  ) {}

  @Get('device/:deviceId')
  async getDevice(
    @Param('deviceId') deviceId: string,
    @ActiveUser() user: CurrentUser,
  ) {
    return this.deviceUseCase.getDevice(user.id, deviceId);
  }

  @Post('device')
  async createDevice(
    @Body() deviceDto: { identifier: string; patientRef: string },
    @ActiveUser() user: CurrentUser,
  ) {
    return this.deviceUseCase.createDevice(user.id, deviceDto);
  }

  @Get('patient')
  async getPatientList(@ActiveUser() user: CurrentUser) {
    return this.patientUseCase.getPatientList(user.id);
  }

  @Get('patient/:id')
  async getPatient(@Param('id') id: string, @ActiveUser() user: CurrentUser) {
    return this.patientUseCase.getPatientById(id, user.id);
  }

  @Put('patient/:id')
  async updatePatient(
    @Param('id') id: string,
    @Body() patientDto: Patient,
    @ActiveUser() user: CurrentUser,
  ) {
    return this.patientUseCase.updatePatient(id, patientDto, user.id);
  }

  @Post('patient')
  async createPatient(
    @Body() patientDto: Patient,
    @ActiveUser() user: CurrentUser,
  ) {
    return this.patientUseCase.createPatient(patientDto, user.id);
  }

  @Post('patient/:patientId/device/:deviceId')
  async assignPatientToDevice(
    @Param('patientId') patientId: string,
    @Param('deviceId') deviceId: string,
    @ActiveUser() user: CurrentUser,
  ) {
    return await this.deviceUseCase.assignPatientToDevice(
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
    return this.patientUseCase.getPatientObservations(id, user.id, count);
  }

  @Get('practitioners')
  async getPractitionerList(
    @ActiveUser() user: CurrentUser,
  ): Promise<Practitioner[]> {
    return this.getPractitionerListUseCase.execute(user.id);
  }

  @Get('practitioners/:id')
  async getPractitioner(
    @Param('id') id: string,
    @ActiveUser() user: CurrentUser,
  ): Promise<Practitioner> {
    return this.getPractitionerByIdUseCase.execute(user.id, id);
  }
}
