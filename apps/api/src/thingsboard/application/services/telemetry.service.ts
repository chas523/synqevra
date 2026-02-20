import { Injectable, Logger, Inject } from '@nestjs/common';


import {
  TelemetryCommand,
  TelemetryResponse,
} from '../../interface/websocket/types/telemetry.types';
import {
  ThingsboardTelemetryPort,
  THINGSBOARD_TELEMETRY_PORT,
} from '../ports/thingsboard.telemetry.port';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../ports/thingsboard.api.port';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(
    @Inject(THINGSBOARD_TELEMETRY_PORT)
    private readonly telemetryPort: ThingsboardTelemetryPort,

    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) { }

  setMessageHandler(handler: (msg: TelemetryResponse) => void): void {
    this.telemetryPort.setMessageHandler(handler);
  }

  async connect(accessToken: string): Promise<void> {
    const result = await this.telemetryPort.connect(accessToken);
    if (result.isErr()) {
      throw result.unwrapErr();
    }
  }

  disconnect(): void {
    this.telemetryPort.disconnect();
  }

  isConnected(): boolean {
    return this.telemetryPort.isConnected();
  }

  //send bulk commands (or single)
  sendCommands(commands: TelemetryCommand[]): void {
    const result = this.telemetryPort.sendCommands(commands);
    if (result.isErr()) {
      throw result.unwrapErr();
    }
  }

  unsubscribe(cmdIdTypes: Map<number, 'ENTITY_COUNT' | 'ENTITY_DATA' | "NOTIFICATIONS_COUNT" | "NOTIFICATIONS">): void {
    const result = this.telemetryPort.unsubscribe(cmdIdTypes);
    if (result.isErr()) {
      throw result.unwrapErr();
    }
  }
}
