import { AlarmStatus } from "../../domain/enums/alarm-status.enum";

export interface UpdateTenantAlarmStatusParamsDto {
  alarmId: string;
  status: AlarmStatus;
}
