import { PendingUserModel } from '../../../domain/models/pending-user.model';
import { PendingUserResponseDto } from '../dtos/pending-user.response.dto';

export class PendingUserResponseMapper {
  static toDto(model: PendingUserModel): PendingUserResponseDto {
    const dto = new PendingUserResponseDto();
    dto.id = model.getId();
    dto.firstName = model.getFirstName();
    dto.lastName = model.getLastName();
    dto.email = model.getEmail().getValue(); // Value Object → string
    dto.status = model.getStatus();
    dto.createdAt = model.getCreatedAt();
    return dto;
  }

  static toDtoBatch(models: PendingUserModel[]): PendingUserResponseDto[] {
    return models.map((model) => this.toDto(model));
  }
}
