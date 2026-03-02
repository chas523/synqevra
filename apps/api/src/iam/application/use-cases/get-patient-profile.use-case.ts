import { Injectable, NotFoundException } from "@nestjs/common";
import { MedplumCredentials } from "src/auth/guards/patient-auth/patient-auth.guard";
import { Role } from "src/iam/domain/enums/role.enum";
import { PatientRepository } from "src/iam/domain/repositories/patient.repository";
import { MedplumClientPort } from "src/medplum/application/ports/medplum-client.port";

@Injectable()
export class GetPatientProfileUseCase {
    constructor(
        private readonly medplumClientPort: MedplumClientPort,
        private readonly patientRepository: PatientRepository
    ) { }

    async execute(patientId: number, credentials: MedplumCredentials) {
        if (!credentials) {
            throw new NotFoundException('Medplum credentials not found');
        }

        const { clientId, clientSecret } = credentials;
        const patientModel = await this.patientRepository.getPatientById(patientId);

        if (!patientModel || !patientModel.email) {
            throw new NotFoundException('Patient not found');
        }

        const patient = await this.medplumClientPort.findPatientProfileByEmailWithClientIdClientSecret(
            patientModel.email,
            clientId,
            clientSecret,
        );

        const name = patient?.name?.[0];
        return {
            id: patient?.id,
            email: patientModel.email,
            firstName: name?.given?.[0] || '',
            lastName: name?.family || '',
            role: Role.PATIENT
        };
    }
}