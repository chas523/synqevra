import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Hl7Message } from '@medplum/core';
import { Hl7MessageDto } from '../../application/dto/hl7-message.dto';
import { SUPPORTED_ADT_TYPES } from '../../infrastructure/utils/hl7-mapping.utils';
import { getMessageType } from '../../infrastructure/utils/hl7-mapping.utils';

@Injectable()
export class Hl7ValidationPipe
  implements PipeTransform<Hl7MessageDto, Hl7MessageDto>
{
  private readonly logger = new Logger(Hl7ValidationPipe.name);

  transform(value: Hl7MessageDto): Hl7MessageDto {
    try {
      const hl7Message = Hl7Message.parse(value.rawMessage);
      const messageType = getMessageType(hl7Message);

      this.logger.log(`Validating message type: ${messageType}`);

      if (!SUPPORTED_ADT_TYPES.includes(messageType)) {
        this.logger.warn(`Unsupported HL7 message type: ${messageType}`);
        throw new BadRequestException(
          `Unsupported HL7 message type: ${messageType}`,
        );
      }

      this.logger.log(`Message type ${messageType} is valid`);

      return value;
    } catch (error) {
      this.logger.error('HL7 validation failed:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        `Invalid HL7 message format: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
