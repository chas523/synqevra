import { Injectable } from '@nestjs/common';

import { AlarmStatus } from '../enums/alarm-status.enum';

@Injectable()
export class AlarmFsmService {
  nextOnAbnormal(currentStatus?: AlarmStatus): AlarmStatus {
    if (!currentStatus) {
      return AlarmStatus.OPEN_UNACK;
    }

    if (
      currentStatus === AlarmStatus.OPEN_UNACK ||
      currentStatus === AlarmStatus.OPEN_ACK
    ) {
      return currentStatus;
    }

    return AlarmStatus.OPEN_UNACK;
  }
}
