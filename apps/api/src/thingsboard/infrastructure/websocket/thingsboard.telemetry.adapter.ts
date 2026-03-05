import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result, Ok, Err } from 'oxide.ts';
import { WebSocket } from 'ws';
import { ThingsboardTelemetryPort } from '../../application/ports/thingsboard.telemetry.port';
import {
  TelemetryCommand,
  TelemetryResponse,
  WebSocketMessage,
  UnsubscribeCommand,
} from '../../interface/websocket/types/telemetry.types';

@Injectable()
export class ThingsboardTelemetryAdapter implements ThingsboardTelemetryPort {
  private readonly logger = new Logger(ThingsboardTelemetryAdapter.name);

  private ws: WebSocket | null = null;
  private authenticated = false;
  private messageHandler: ((msg: TelemetryResponse) => void) | null = null;

  constructor(private readonly configService: ConfigService) {}

  isConnected(): boolean {
    return (
      this.ws !== null &&
      this.ws.readyState === WebSocket.OPEN &&
      this.authenticated
    );
  }

  setMessageHandler(handler: (msg: TelemetryResponse) => void): void {
    this.messageHandler = handler;
  }

  async connect(accessToken: string): Promise<Result<void, Error>> {
    if (this.isConnected()) {
      this.logger.log('already connected');
      return Ok(undefined);
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    return new Promise((resolve) => {
      const wsUrl = this.buildWebSocketUrl();
      this.logger.log(`connecting to: ${wsUrl}`);

      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        this.logger.log('connected, authenticating...');

        const authMessage: WebSocketMessage = {
          cmds: [],
          authCmd: { cmdId: 0, token: accessToken },
        };
        this.ws!.send(JSON.stringify(authMessage));

        this.authenticated = true;
        this.logger.log('authenticated');
        resolve(Ok(undefined));
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const parsed = JSON.parse(data.toString()) as TelemetryResponse;

          if (parsed.errorCode !== 0) {
            this.logger.error(`thingsboard error: ${parsed.errorMsg}`);
          }

          if (this.messageHandler) {
            this.messageHandler(parsed);
          }
        } catch (error) {
          this.logger.error('message parsing error:', error);
        }
      });

      this.ws.on('error', (error) => {
        this.logger.error('websocket error:', error.message);
        resolve(Err(new Error(`websocket error: ${error.message}`)));
      });

      this.ws.on('close', (code) => {
        this.logger.log(`disconnected (code: ${code})`);
        this.authenticated = false;
      });
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.authenticated = false;
    this.messageHandler = null;
    this.logger.log('disconnected');
  }

  sendCommands(commands: TelemetryCommand[]): Result<void, Error> {
    if (!this.isConnected() || !this.ws) {
      return Err(new Error('not connected to websocket'));
    }

    const message: WebSocketMessage = { cmds: commands };
    this.ws.send(JSON.stringify(message));

    this.logger.log(
      `sent ${commands.length} commands: ${commands.map((c) => c.cmdId).join(', ')}`,
    );
    return Ok(undefined);
  }

  unsubscribe(
    cmdIdTypes: Map<
      number,
      'ENTITY_COUNT' | 'ENTITY_DATA' | 'NOTIFICATIONS_COUNT' | 'NOTIFICATIONS'
    >,
  ): Result<void, Error> {
    if (!this.isConnected() || !this.ws) {
      return Err(new Error('not connected to websocket'));
    }

    if (cmdIdTypes.size === 0) {
      return Ok(undefined);
    }

    const commands: UnsubscribeCommand[] = [];
    for (const [cmdId, type] of cmdIdTypes) {
      if (type === 'ENTITY_COUNT') {
        commands.push({
          cmdId,
          type: 'ENTITY_COUNT_UNSUBSCRIBE',
        });
      } else if (type === 'ENTITY_DATA') {
        commands.push({
          cmdId,
          type: 'ENTITY_DATA_UNSUBSCRIBE',
        });
      }
    }

    const message: WebSocketMessage = { cmds: commands };
    this.ws.send(JSON.stringify(message));

    this.logger.log(
      `unsubscribing ${commands.length} commands: ${commands.map((c) => `${c.type}(${c.cmdId})`).join(', ')}`,
    );
    return Ok(undefined);
  }

  private buildWebSocketUrl(): string {
    let url = this.configService.getOrThrow<string>('THINGSBOARD_API_URL');

    if (!url.endsWith('/api')) {
      url = `${url}/api`;
    }

    return (
      url.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws'
    );
  }
}
