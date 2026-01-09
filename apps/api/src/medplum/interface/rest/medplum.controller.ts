import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ActiveUser } from '../../../auth/decorators/active-user.decorator';
import type { CurrentUser } from '../../../auth/types/current-user';
import type { Observation, Patient, Practitioner } from '@medplum/fhirtypes';
import { DeviceUseCase } from '../../application/use-cases/device.use-case';
import { PatientUseCase } from '../../application/use-cases/patient.use-case';
import { GetPractitionerByIdUseCase } from '../../application/use-cases/get-practitioner-by-id.use-case';
import { GetPractitionerListUseCase } from 'src/medplum/application/use-cases/get-practitioner-list.use-case';
import { CreateDeviceRequestDto } from './dto/create-device.request.dto';
import { AssignPatientToDeviceResponseDto } from './dto/assign-patient-to-device.response.dto';
import { Device } from '@medplum/fhirtypes';

@ApiTags('Medplum')
@ApiBearerAuth()
@Controller('medplum')
export class MedplumController {
  constructor(
    private readonly deviceUseCase: DeviceUseCase,
    private readonly patientUseCase: PatientUseCase,
    private readonly getPractitionerListUseCase: GetPractitionerListUseCase,
    private readonly getPractitionerByIdUseCase: GetPractitionerByIdUseCase,
  ) {}

  @Get('device/:deviceId')
  @ApiOperation({
    summary: 'Get Medplum device by ID',
    description:
      'Retrieve Medplum device information from Medplum by device ID',
  })
  @ApiParam({
    name: 'deviceId',
    type: String,
    description: 'The FHIR device ID',
    example: 'Device/12345',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Device not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  async getDevice(
    @Param('deviceId') deviceId: string,
    @ActiveUser() user: CurrentUser,
  ) {
    return this.deviceUseCase.getDevice(user.id, deviceId);
  }

  @Post('device')
  @ApiOperation({
    summary: '(NOT USED) Create a new device in Medplum',
    description: 'Create a new device resource in Medplum',
  })
  @ApiBody({
    type: CreateDeviceRequestDto,
    description: 'Device creation data',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Device created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  async createDevice(
    @Body() deviceDto: CreateDeviceRequestDto,
    @ActiveUser() user: CurrentUser,
  ) {
    return this.deviceUseCase.createDevice(user.id, deviceDto);
  }

  @Get('patient')
  @ApiOperation({
    summary: 'Get patient list from Medplum',
    description:
      'Retrieve a list of all patients accessible to the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of patients retrieved successfully',
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  async getPatientList(@ActiveUser() user: CurrentUser) {
    return this.patientUseCase.getPatientList(user.id);
  }

  @Get('patient/:id')
  @ApiOperation({
    summary: 'Get patient by ID from Medplum',
    description: 'Retrieve patient information by patient ID from Medplum',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The FHIR patient ID',
    example: 'Patient/12345',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  async getPatient(@Param('id') id: string, @ActiveUser() user: CurrentUser) {
    return this.patientUseCase.getPatientById(id, user.id);
  }

  @Put('patient/:id')
  @ApiOperation({
    summary: 'Update patient in Medplum',
    description: 'Update patient resource in Medplum',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The FHIR patient ID',
    example: 'Patient/12345',
  })
  @ApiBody({
    type: 'object',
    description: 'Patient data to update (FHIR Patient resource)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  async updatePatient(
    @Param('id') id: string,
    @Body() patientDto: Patient,
    @ActiveUser() user: CurrentUser,
  ) {
    return this.patientUseCase.updatePatient(id, patientDto, user.id);
  }

  @Post('patient')
  @ApiOperation({
    summary: 'Create a new patient in Medplum',
    description: 'Create a new patient resource in Medplum',
  })
  @ApiBody({
    type: 'object',
    description: 'Patient data (FHIR Patient resource)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Patient created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  async createPatient(
    @Body() patientDto: Patient,
    @ActiveUser() user: CurrentUser,
  ) {
    return this.patientUseCase.createPatient(patientDto, user.id);
  }

  @Post('patient/:patientId/device/:deviceId')
  @ApiOperation({
    summary: 'Assign patient to device between Medplum resources',
    description:
      'Create an association between a patient and a medical device only in Medplum resources',
  })
  @ApiParam({
    name: 'patientId',
    type: String,
    description: 'The FHIR patient ID',
    example: 'Patient/12345',
  })
  @ApiParam({
    name: 'deviceId',
    type: String,
    description: 'The FHIR device ID',
    example: 'Device/67890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient assigned to device successfully',
    type: AssignPatientToDeviceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid patient or device ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient or device not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
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
  @ApiOperation({
    summary: 'Get patient observations',
    description: 'Retrieve all medical observations for a specific patient',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The FHIR patient ID',
    example: 'Patient/12345',
  })
  @ApiQuery({
    name: 'count',
    type: Number,
    required: false,
    description: 'Maximum number of observations to return',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Observations retrieved successfully',
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  async getPatientObservations(
    @ActiveUser() user: CurrentUser,
    @Param('id') id: string,
    @Query('count') count?: number,
  ): Promise<Observation[]> {
    return this.patientUseCase.getPatientObservations(id, user.id, count);
  }

  @Get('practitioners')
  @ApiOperation({
    summary: 'Get practitioners list from Medplum',
    description:
      'Retrieve a list of all practitioners for specific project (so only those accessible to the authenticated user)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of practitioners retrieved successfully',
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  async getPractitionerList(
    @ActiveUser() user: CurrentUser,
  ): Promise<Practitioner[]> {
    return this.getPractitionerListUseCase.execute(user.id);
  }

  @Get('practitioners/:id')
  @ApiOperation({
    summary: 'Get practitioner by ID from Medplum',
    description:
      'Retrieve practitioner information by practitioner ID from Medplum',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The FHIR practitioner ID',
    example: 'Practitioner/12345',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Practitioner retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Practitioner not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  async getPractitioner(
    @Param('id') id: string,
    @ActiveUser() user: CurrentUser,
  ): Promise<Practitioner> {
    return this.getPractitionerByIdUseCase.execute(user.id, id);
  }
}
