import { IsEnum } from "class-validator";

import { AlarmStatus } from "../../../../domain/enums/alarm-status.enum";

export class UpdateTenantAlarmStatusRequestDto {
  @IsEnum(AlarmStatus)
  status: AlarmStatus;
}
