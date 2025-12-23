import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MedplumRegistrationService } from '../services/medplum-registration.service';
import { UnitOfWork } from '../../../connection/infrastructure/transaction/unit-of-work';
import { CreateProjectDto } from '../../interface/rest/dto/createProjectDto';

@Injectable()
export class RegisterMedplumUseCase {
  constructor(
    private readonly registrationService: MedplumRegistrationService,
  ) {}

  async execute(dto: CreateProjectDto, userId: number, uow: UnitOfWork) {
    const connection =
      await uow.connectionRepository.getOrCreateByUserId(userId);
    if (connection.medplumId) {
      throw new BadRequestException(
        'Medplum connection already exists for this user',
      );
    }

    const { clientId, clientSecret } =
      await this.registrationService.registerAndGetClientApp(dto);

    const medplum = uow.medplumRepository.create({
      client_id: clientId,
      client_secret: clientSecret,
      connection: connection,
    });
    if (!medplum) {
      throw new InternalServerErrorException('Failed to create Medplum model');
    }

    const saved = await uow.medplumRepository.save(medplum);
    if (!saved) {
      throw new InternalServerErrorException('Failed to save Medplum config');
    }

    return saved;
  }
}
