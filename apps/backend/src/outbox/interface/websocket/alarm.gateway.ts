import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { ThingsboardWsAuthGuard } from '../../../auth/guards/thingsboard-ws-auth/thingsboard-ws-auth.guard';
import type { SocketWithUser } from '../../../auth/guards/thingsboard-ws-auth/thingsboard-ws-auth.guard';
import { Role } from '../../../iam/domain/enums/role.enum';
import {
  THINGSBOARD_REPOSITORY_PORT,
  ThingsboardRepositoryPort,
} from '../../../thingsboard/application/ports/thingsboard.repository.port';
import { Inject } from '@nestjs/common';

const WS_ALLOWED_ORIGINS = process.env.CORS_ORIGIN?.split(',').map((item) =>
  item.trim(),
) || ['http://localhost:3000', 'http://localhost:8088'];

interface SubscribeAlarmsPayload {
  tenantId?: string;
}

export interface WebAppAlarmEventPayload {
  schemaVersion: 1;
  alarmId: string;
  tenantId: string;
  deviceId: string;
  alarmType: string;
  status?: string;
  currentValue: Record<string, unknown>;
  thresholdSnapshot: Record<string, unknown>;
  eventId: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

@WebSocketGateway({
  namespace: 'alarms',
  cors: {
    origin: WS_ALLOWED_ORIGINS,
    credentials: true,
  },
})
export class AlarmGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AlarmGateway.name);

  constructor(
    @Inject(THINGSBOARD_REPOSITORY_PORT)
    private readonly thingsboardRepository: ThingsboardRepositoryPort,
  ) {}

  afterInit(): void {
    this.logger.log(
      `Alarm websocket gateway initialized. Allowed origins: ${WS_ALLOWED_ORIGINS.join(', ')}`,
    );
  }

  @UseGuards(ThingsboardWsAuthGuard)
  @SubscribeMessage('subscribe-tenant-alarms')
  async subscribeTenantAlarms(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() payload: SubscribeAlarmsPayload,
  ): Promise<void> {
    if (!client.user) {
      client.emit('alarms-error', {
        message: 'Missing websocket user context',
      });
      return;
    }

    if (client.user.role === Role.ADMIN) {
      client.emit('alarms-error', {
        message: 'Alarm stream is not available for admin role',
      });
      return;
    }

    const expectedTenantId = await this.resolveTenantId(client.user.id);
    if (!expectedTenantId) {
      client.emit('alarms-error', {
        message: 'Unable to resolve tenant scope for alarm stream',
      });
      return;
    }

    const requestedTenantId = payload?.tenantId?.trim();
    if (requestedTenantId && requestedTenantId !== expectedTenantId) {
      client.emit('alarms-error', {
        message: 'Forbidden tenant alarm subscription scope',
      });
      return;
    }

    const room = this.getTenantRoom(expectedTenantId);
    await client.join(room);

    this.logger.log(
      `Alarm socket subscribed: clientId=${client.id}, userId=${client.user.id}, role=${client.user.role}, tenantId=${expectedTenantId}`,
    );

    client.emit('alarms-subscribed', { tenantId: expectedTenantId });
  }

  emitAlarmForTenant(tenantId: string, payload: WebAppAlarmEventPayload): void {
    const room = this.getTenantRoom(tenantId);
    this.server.to(room).emit('alarm-event', payload);
  }

  private async resolveTenantId(userId: number): Promise<string | null> {
    const thingsboardRow =
      await this.thingsboardRepository.findByUserId(userId);
    return thingsboardRow?.getTenantId() ?? null;
  }

  private getTenantRoom(tenantId: string): string {
    return `tenant:${tenantId}`;
  }
}
