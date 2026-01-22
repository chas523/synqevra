import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

    private readonly configService: ConfigService,
  ) {}

  setMessageHandler(handler: (msg: TelemetryResponse) => void): void {
    this.telemetryPort.setMessageHandler(handler);
  }

  async connect(accessToken: string): Promise<void> {
    // after implementing admin dashboard remove const token = await this.connectAsSysadmin();
    const token = await this.connectAsSysadmin();
    const result = await this.telemetryPort.connect(token);
    if (result.isErr()) {
      throw result.unwrapErr();
    }
  }

  async connectAsSysadmin(): Promise<string> {
    const email = this.configService.getOrThrow<string>(
      'THINGSBOARD_SYSADMIN_EMAIL',
    );
    const password = this.configService.getOrThrow<string>(
      'THINGSBOARD_SYSADMIN_PASSWORD',
    );

    const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
      email,
      password,
    );

    return loginResponse.token;
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

  unsubscribe(cmdIdTypes: Map<number, 'ENTITY_COUNT' | 'ENTITY_DATA'>): void {
    const result = this.telemetryPort.unsubscribe(cmdIdTypes);
    if (result.isErr()) {
      throw result.unwrapErr();
    }
  }
}
