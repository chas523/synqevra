import { AbnormalEventDto } from '../../dto/abnormal-event.dto';

export class ProcessAbnormalEventCommand {
  constructor(
    public readonly event: AbnormalEventDto,
    public readonly sourceTopic?: string,
  ) {}
}
