import { PatientUseCase } from './patient.use-case';
import { MedplumClientPort } from '../ports/medplum-client.port';
import { WithId } from '@medplum/core';
import { Observation, Patient } from '@medplum/fhirtypes';

describe('PatientUseCase', () => {
  let useCase: PatientUseCase;
  let medplumClient: jest.Mocked<MedplumClientPort>;

  const userId = 1;
  const mockPatient: Patient = {
    resourceType: 'Patient',
  };
  const mockObservation: Observation = {
    resourceType: 'Observation',
    status: 'unknown',
    code: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();

    medplumClient = {
      getPatientList: jest.fn().mockReturnValue([mockPatient]),
      findPatientById: jest.fn().mockReturnValue({
        ...mockPatient,
        id: 'patientId',
      } as WithId<Patient>),
      updatePatient: jest.fn().mockReturnValue({
        ...mockPatient,
        id: 'updatedId',
      } as WithId<Patient>),
      createPatient: jest.fn().mockReturnValue(mockPatient),
      findPatientObservations: jest.fn().mockReturnValue([mockObservation]),
    } as unknown as jest.Mocked<MedplumClientPort>;

    useCase = new PatientUseCase(medplumClient);
  });

  it('should get promise of patient list', async () => {
    const result = useCase.getPatientList(userId);

    expect(medplumClient.getPatientList).toHaveBeenCalledWith(userId);
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toEqual([mockPatient]);
  });

  it('should get promise of patient by id', async () => {
    const result = useCase.getPatientById('patientId', userId);

    expect(medplumClient.findPatientById).toHaveBeenCalledWith(
      'patientId',
      userId,
    );
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toEqual({ ...mockPatient, id: 'patientId' });
  });

  it('should update patient and return it', async () => {
    const patientDto: Patient = { resourceType: 'Patient' };

    const result = useCase.updatePatient('patientId', patientDto, userId);

    expect(medplumClient.updatePatient).toHaveBeenCalledWith(
      'patientId',
      patientDto,
      userId,
    );
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toEqual({ ...mockPatient, id: 'updatedId' });
  });

  it('should create patient and return it', async () => {
    const patientDto: Patient = { resourceType: 'Patient' };

    const result = useCase.createPatient(patientDto, userId);

    expect(medplumClient.createPatient).toHaveBeenCalledWith(
      patientDto,
      userId,
    );
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toEqual(mockPatient);
  });

  it('should get patient observations and return them', async () => {
    const result = useCase.getPatientObservations('patientId', userId, 5);

    expect(medplumClient.findPatientObservations).toHaveBeenCalledWith(
      'patientId',
      5,
      userId,
    );
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toEqual([mockObservation]);
  });
});
