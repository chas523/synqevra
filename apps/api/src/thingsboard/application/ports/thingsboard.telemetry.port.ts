import { Result } from 'oxide.ts';

import {
  TelemetryCommand,
  TelemetryResponse,
} from '../../interface/websocket/types/telemetry.types';

export abstract class ThingsboardTelemetryPort {
  /**
   * Function handler, it's possible to define what to do with incoming message
   */
  abstract setMessageHandler(handler: (msg: TelemetryResponse) => void): void;

  abstract connect(accessToken: string): Promise<Result<void, Error>>;
  abstract disconnect(): void;
  abstract isConnected(): boolean;
  abstract sendCommands(commands: TelemetryCommand[]): Result<void, Error>;
  abstract unsubscribe(
    cmdIdTypes: Map<number, 'ENTITY_COUNT' | 'ENTITY_DATA' | "NOTIFICATIONS_COUNT" | "NOTIFICATIONS">,
  ): Result<void, Error>;
}

export const THINGSBOARD_TELEMETRY_PORT = Symbol('ThingsboardTelemetryPort');
