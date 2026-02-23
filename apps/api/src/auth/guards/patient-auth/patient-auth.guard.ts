import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from 'src/iam/domain/enums/role.enum';
import { PatientMedplumRepository } from 'src/iam/domain/repositories/patient-medplum.repository';
import { MedplumRepository } from 'src/medplum/domain/repositories/medplum.repository';
import type { CurrentUser } from 'src/auth/types/current-user';

export interface MedplumCredentials {
    clientId: string;
    clientSecret: string;
    medplumId: number;
}

export interface RequestWithMedplumCredentials extends Request {
    patientId?: number;
    medplumCredentials?: MedplumCredentials;
}

@Injectable()
export class PatientAuthGuard implements CanActivate {
    constructor(
        private readonly patientMedplumRepository: PatientMedplumRepository,
        private readonly medplumRepository: MedplumRepository,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context
            .switchToHttp()
            .getRequest<RequestWithMedplumCredentials>();

        //req user through jwt-patient strategy
        const user = req.user as CurrentUser | undefined;
        if (!user?.id) {
            throw new UnauthorizedException('User not authenticated');
        }

        if (user.connectionRole !== Role.PATIENT) {
            throw new ForbiddenException('Access restricted to patients');
        }

        const patientId = user.id;

        //patientId -> patients_medplum -> medplumId
        const patientMedplum =
            await this.patientMedplumRepository.getByPatientId(patientId);

        if (!patientMedplum) {
            throw new NotFoundException(
                `Medplum mapping not found for patient ${patientId}`,
            );
        }

        //medplumId -> medplum -> client_id + client_secret
        const medplumRecord = await this.medplumRepository.findById(
            patientMedplum.medplumId,
        );

        if (!medplumRecord) {
            throw new NotFoundException(
                `Medplum credentials not found for medplumId ${patientMedplum.medplumId}`,
            );
        }

        req.patientId = patientId;
        req.medplumCredentials = {
            clientId: medplumRecord.client_id,
            clientSecret: medplumRecord.client_secret,
            medplumId: patientMedplum.medplumId,
        };

        return true;
    }
}
