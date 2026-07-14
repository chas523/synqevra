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

  nextOnManualUpdate(
    currentStatus: AlarmStatus,
    requestedStatus: AlarmStatus,
  ): AlarmStatus {
    if (currentStatus === requestedStatus) {
      return currentStatus;
    }

    if (currentStatus === AlarmStatus.OPEN_UNACK) {
      if (
        requestedStatus === AlarmStatus.OPEN_ACK ||
        requestedStatus === AlarmStatus.RESOLVED
      ) {
        return requestedStatus;
      }
    }

    if (currentStatus === AlarmStatus.OPEN_ACK) {
      if (
        requestedStatus === AlarmStatus.OPEN_UNACK ||
        requestedStatus === AlarmStatus.RESOLVED
      ) {
        return requestedStatus;
      }
    }

    if (
      currentStatus === AlarmStatus.RESOLVED &&
      requestedStatus === AlarmStatus.OPEN_UNACK
    ) {
      return requestedStatus;
    }

    throw new Error(
      `Invalid manual alarm transition: ${currentStatus} -> ${requestedStatus}`,
    );
  }
}
