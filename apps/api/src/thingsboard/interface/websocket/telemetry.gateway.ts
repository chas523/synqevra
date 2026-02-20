import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TelemetryService } from '../../application/services/telemetry.service';
import { DashboardQueries } from '../../application/services/dashboard-queries';
import { TelemetryParserService } from '../../application/services/telemetry-parser.service';
import { TelemetryResponse } from 'src/thingsboard/interface/websocket/types/telemetry.types';
import {
  NotificationCountCommand,
  NotificationsCommand,
  MarkNotificationsReadCommand,
} from 'src/thingsboard/interface/websocket/types/telemetry.types';
import { ThingsboardWsAuthGuard } from 'src/auth/guards/thingsboard-ws-auth/thingsboard-ws-auth.guard';
import { WsTbAccessToken } from 'src/auth/decorators/ws-tb-access-token.decorator';

/**
 * WebSocket Gateway - proxy between ThingsBoard and frontend.
 * Frontend sends simple events (topics), backend knows which commands to send.
 */
@WebSocketGateway({
  namespace: 'telemetry',
  cors: {
    origin: '*',
  },
})
export class TelemetryGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TelemetryGateway.name);
  private isThingsboardConnected = false;
  private isConnecting = false;

  private cmdIdToTopic = new Map<number, string>();
  private cmdIdToCommandType = new Map<
    number,
    'ENTITY_COUNT' | 'ENTITY_DATA' | 'NOTIFICATIONS_COUNT' | 'NOTIFICATIONS'
  >();
  private clientSubscriptions = new Map<string, Set<number>>();
  private activeSubscriptions = new Set<number>();

  constructor(
    private readonly telemetryService: TelemetryService,
    private readonly parserService: TelemetryParserService,
  ) { }

  handleConnection(client: Socket) {
    this.logger.log(`client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`client disconnected: ${client.id}`);

    try {
      const clientCmdIds = this.clientSubscriptions.get(client.id);
      if (!clientCmdIds || clientCmdIds.size === 0) {
        return;
      }

      this.clientSubscriptions.delete(client.id);

      const cmdIdsToUnsubscribe = new Set<number>();
      for (const cmdId of clientCmdIds) {
        let isUsedByOther = false;
        for (const [otherClientId, otherCmdIds] of this.clientSubscriptions) {
          if (otherCmdIds.has(cmdId)) {
            isUsedByOther = true;
            break;
          }
        }

        if (!isUsedByOther) {
          cmdIdsToUnsubscribe.add(cmdId);
          this.activeSubscriptions.delete(cmdId);
        }
      }

      if (cmdIdsToUnsubscribe.size > 0) {
        const cmdIdTypes = new Map<
          number,
          | 'ENTITY_COUNT'
          | 'ENTITY_DATA'
          | 'NOTIFICATIONS_COUNT'
          | 'NOTIFICATIONS'
        >();
        for (const cmdId of cmdIdsToUnsubscribe) {
          const type = this.cmdIdToCommandType.get(cmdId);
          if (type) {
            cmdIdTypes.set(cmdId, type);
          }
        }

        if (cmdIdTypes.size > 0) {
          this.logger.log(`unsubscribing ${cmdIdTypes.size} commands`);
          this.telemetryService.unsubscribe(cmdIdTypes);
        }
      }

      if (this.clientSubscriptions.size === 0 && this.isThingsboardConnected) {
        this.logger.log('no clients left, disconnecting thingsboard');
        this.telemetryService.disconnect();
        this.isThingsboardConnected = false;
        this.cmdIdToTopic.clear();
        this.cmdIdToCommandType.clear();
        this.activeSubscriptions.clear();
      }
    } catch (error) {
      this.logger.error('error in handleDisconnect:', error.message);
    }
  }

  @UseGuards(ThingsboardWsAuthGuard)
  @SubscribeMessage('connect-thingsboard')
  async handleConnectThingsboard(
    @WsTbAccessToken() accessToken: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('connectted to tb with token: ', accessToken);
    try {
      if (this.isThingsboardConnected) {
        client.emit('thingsboard-connected', { success: true });
        return;
      }

      if (this.isConnecting) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (this.isThingsboardConnected) {
          client.emit('thingsboard-connected', { success: true });
          return;
        }
      }

      this.isConnecting = true;

      this.telemetryService.setMessageHandler((msg) => {
        this.handleIncomingMessage(msg);
      });

      // Use token from guard
      await this.telemetryService.connect(accessToken);

      this.isThingsboardConnected = true;
      this.isConnecting = false;
      this.logger.log('connected to thingsboard');

      this.server.emit('thingsboard-connected', { success: true });
    } catch (error) {
      this.isConnecting = false;
      this.logger.error('thingsboard connection error:', error);
      client.emit('thingsboard-error', {
        message: error.message,
      });
    }
  }

  @UseGuards(ThingsboardWsAuthGuard)
  @SubscribeMessage('entity-count')
  handleEntityCount(@ConnectedSocket() client: Socket) {
    try {
      if (!this.isThingsboardConnected) {
        client.emit('error', { message: 'not connected to thingsboard' });
        return;
      }

      const commands = DashboardQueries.allEntityCounts();

      if (!this.clientSubscriptions.has(client.id)) {
        this.clientSubscriptions.set(client.id, new Set());
      }
      const clientSubs = this.clientSubscriptions.get(client.id)!;

      commands.forEach((cmd) => {
        this.cmdIdToTopic.set(cmd.cmdId, 'entity-count');
        this.cmdIdToCommandType.set(cmd.cmdId, 'ENTITY_COUNT');
        this.activeSubscriptions.add(cmd.cmdId);
        clientSubs.add(cmd.cmdId);
      });

      this.telemetryService.sendCommands(commands);

      client.emit('commands-sent', {
        success: true,
        topic: 'entity-count',
        count: commands.length,
      });
    } catch (error) {
      this.logger.error('entity-count error:', error);
      client.emit('error', { message: error.message });
    }
  }

  @UseGuards(ThingsboardWsAuthGuard)
  @SubscribeMessage('systemMetricsChart')
  async handleSystemMetrics(@ConnectedSocket() client: Socket) {
    try {
      if (!this.isThingsboardConnected) {
        client.emit('error', { message: 'not connected to thingsboard' });
        return;
      }
      const [queryCmd, tsCmd] =
        DashboardQueries.systemMetricsWithTimeseries(10);

      if (!this.clientSubscriptions.has(client.id)) {
        this.clientSubscriptions.set(client.id, new Set());
      }
      const clientSubs = this.clientSubscriptions.get(client.id)!;

      this.cmdIdToTopic.set(queryCmd.cmdId, 'systemMetricsChart');
      this.cmdIdToTopic.set(tsCmd.cmdId, 'systemMetricsChart');
      this.cmdIdToCommandType.set(queryCmd.cmdId, 'ENTITY_DATA');
      this.cmdIdToCommandType.set(tsCmd.cmdId, 'ENTITY_DATA');
      this.activeSubscriptions.add(queryCmd.cmdId);
      this.activeSubscriptions.add(tsCmd.cmdId);
      clientSubs.add(queryCmd.cmdId);
      clientSubs.add(tsCmd.cmdId);

      this.telemetryService.sendCommands([queryCmd]);

      await this.delay(500);
      this.telemetryService.sendCommands([tsCmd]);

      client.emit('commands-sent', {
        success: true,
        topic: 'systemMetricsChart',
        count: 2,
      });
    } catch (error) {
      this.logger.error('systemMetricsChart error:', error);
      client.emit('error', { message: error.message });
    }
  }

  @UseGuards(ThingsboardWsAuthGuard)
  @SubscribeMessage('transportMsgCountHourly')
  async handleMsgDeviceCommunication(@ConnectedSocket() client: Socket) {
    try {
      if (!this.isThingsboardConnected) {
        client.emit('error', { message: 'not connected to thingsboard' });
        return;
      }
      const [queryCmd, historyCmd] =
        DashboardQueries.msgDeviceCommunicationWithTimeseries(9);

      if (!this.clientSubscriptions.has(client.id)) {
        this.clientSubscriptions.set(client.id, new Set());
      }
      const clientSubs = this.clientSubscriptions.get(client.id)!;

      this.cmdIdToTopic.set(queryCmd.cmdId, 'transportMsgCountHourly');
      this.cmdIdToTopic.set(historyCmd.cmdId, 'transportMsgCountHourly');
      this.cmdIdToCommandType.set(queryCmd.cmdId, 'ENTITY_DATA');
      this.cmdIdToCommandType.set(historyCmd.cmdId, 'ENTITY_DATA');
      this.activeSubscriptions.add(queryCmd.cmdId);
      this.activeSubscriptions.add(historyCmd.cmdId);
      clientSubs.add(queryCmd.cmdId);
      clientSubs.add(historyCmd.cmdId);

      this.telemetryService.sendCommands([queryCmd]);

      await this.delay(500);
      this.telemetryService.sendCommands([historyCmd]);

      client.emit('commands-sent', {
        success: true,
        topic: 'transportMsgCountHourly',
        count: 2,
      });
    } catch (error) {
      this.logger.error('transportMsgCountHourly error:', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('disconnect-thingsboard')
  handleDisconnectThingsboard(@ConnectedSocket() client: Socket) {
    if (this.isThingsboardConnected) {
      this.telemetryService.disconnect();
      this.isThingsboardConnected = false;
      this.logger.log('thingsboard disconnected');
      this.server.emit('thingsboard-disconnected', { success: true });
    }
  }


  @UseGuards(ThingsboardWsAuthGuard)
  @SubscribeMessage('notifications-count')
  handleNotificationsCount(@ConnectedSocket() client: Socket) {
    try {
      if (!this.isThingsboardConnected) {
        client.emit('error', { message: 'not connected to thingsboard' });
        return;
      }

      if (!this.clientSubscriptions.has(client.id)) {
        this.clientSubscriptions.set(client.id, new Set());
      }
      const clientSubs = this.clientSubscriptions.get(client.id)!;

      const cmdId = 1;
      this.cmdIdToTopic.set(cmdId, 'notifications-count');
      this.cmdIdToCommandType.set(cmdId, 'NOTIFICATIONS_COUNT');
      this.activeSubscriptions.add(cmdId);
      clientSubs.add(cmdId);

      const command: NotificationCountCommand = {
        type: 'NOTIFICATIONS_COUNT',
        cmdId: cmdId,
      };
      this.telemetryService.sendCommands([command]);
    } catch (error) {
      this.logger.error('notifications-count error:', error);
      client.emit('error', { message: error.message });
    }
  }

  @UseGuards(ThingsboardWsAuthGuard)
  @SubscribeMessage('notifications')
  handleNotifications(@ConnectedSocket() client: Socket) {
    try {
      if (!this.isThingsboardConnected) {
        client.emit('error', { message: 'not connected to thingsboard' });
        return;
      }

      if (!this.clientSubscriptions.has(client.id)) {
        this.clientSubscriptions.set(client.id, new Set());
      }
      const clientSubs = this.clientSubscriptions.get(client.id)!;

      const cmdId = 10;
      this.cmdIdToTopic.set(cmdId, 'notifications');
      this.cmdIdToCommandType.set(cmdId, 'NOTIFICATIONS');
      this.activeSubscriptions.add(cmdId);
      clientSubs.add(cmdId);

      const command: NotificationsCommand = {
        type: 'NOTIFICATIONS',
        limit: 6,
        types: [],
        cmdId: cmdId,
      };
      this.telemetryService.sendCommands([command]);
    } catch (error) {
      this.logger.error('notifications error:', error);
      client.emit('error', { message: error.message });
    }
  }

  @UseGuards(ThingsboardWsAuthGuard)
  @SubscribeMessage('mark-notifications-read')
  handleMarkNotificationsAsRead(
    @MessageBody() data: { notifications: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!this.isThingsboardConnected) {
        client.emit('error', { message: 'not connected to thingsboard' });
        return;
      }

      if (!data.notifications || !Array.isArray(data.notifications)) {
        return;
      }

      const cmdId = 11;
      // We don't subscribe to cmdId 11 (it's a one-off action), but we might map it just in case
      this.cmdIdToTopic.set(cmdId, 'mark-notifications-read');

      const command: MarkNotificationsReadCommand = {
        type: 'MARK_NOTIFICATIONS_AS_READ',
        notifications: data.notifications,
        cmdId: cmdId,
      };
      this.telemetryService.sendCommands([command]);
    } catch (error) {
      this.logger.error('mark-notifications-read error:', error);
      client.emit('error', { message: error.message });
    }
  }

  private isTelemetryResponse(msg: unknown): msg is TelemetryResponse {
    return (
      typeof msg === 'object' &&
      msg !== null &&
      'cmdId' in msg &&
      typeof (msg as TelemetryResponse).cmdId === 'number'
    );
  }

  private handleIncomingMessage(msg: unknown) {
    if (!this.isTelemetryResponse(msg)) {
      this.logger.error(
        `invalid telemetry response format: ${JSON.stringify(msg)}`,
      );
      throw new Error('Invalid telemetry response format');
    }

    const topic = this.cmdIdToTopic.get(msg.cmdId);

    if (!topic) {
      this.logger.warn(`unknown cmdId: ${msg.cmdId}`);
      this.server.emit('telemetry-raw', msg);
      return;
    }

    try {
      switch (topic) {
        case 'entity-count': {
          const parsed = this.parserService.parseEntityCount(msg);
          if (parsed) {
            this.logger.debug(`entity-count: ${parsed.type} = ${parsed.count}`);
            this.server.emit('entity-count', parsed);
          }
          break;
        }
        case 'systemMetricsChart': {
          const parsed = this.parserService.parseSystemMetrics(msg);
          if (parsed) {
            this.logger.debug(`systemMetricsChart: ${parsed.length} records`);
            this.server.emit('systemMetricsChart', parsed);
          }
          break;
        }
        case 'transportMsgCountHourly': {
          const parsed =
            this.parserService.parseMsgDeviceCommunicationCount(msg);
          if (parsed) {
            this.logger.debug(
              `transportMsgCountHourly: ${parsed.length} records`,
            );
            this.server.emit('transportMsgCountHourly', parsed);
          }
          break;
        }

        case 'notifications-count': {
          const parsed = this.parserService.parseNotificationCount(msg);
          if (parsed) {
            this.logger.debug(
              `notifications-count: ${parsed.count} (cmdId: ${parsed.cmdId})`,
            );
            this.server.emit('notifications-count', parsed);
          }
          break;
        }
        case 'notifications': {
          const parsed = this.parserService.parseNotifications(msg);
          if (parsed) {
            this.logger.debug(
              `notifications: ${parsed.notifications.length} items (count: ${parsed.count})`,
            );
            this.server.emit('notifications', parsed);
          }
          break;
        }
      }
    } catch (error) {
      this.logger.error(`parsing error ${topic}:`, error);
      this.server.emit('error', {
        topic,
        message: error.message,
      });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
