import { ConnectionModel } from '../../../connection/domain/entities/connection.model';

export class ThingsboardModel {
  constructor(
    private project: string,
    private tenantId: string,
    private readonly id?: number,
    private accessToken?: string,
    private refreshToken?: string,
    private connectionId?: number,
  ) {}

  static create(
    project: string,
    tenantId: string,
    connection: ConnectionModel,
  ): ThingsboardModel {
    if (!project || !tenantId) {
      throw new Error('Project and tenant ID are required');
    }
    return new ThingsboardModel(
      project,
      tenantId,
      undefined,
      undefined,
      undefined,
      connection.id,
    );
  }

  getId(): number {
    if (!this.id) throw new Error('Model has not been persisted yet');
    return this.id;
  }

  isPersisted(): boolean {
    return this.id !== undefined;
  }

  getProject(): string {
    return this.project;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getAccessToken(): string | undefined {
    return this.accessToken;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getRefreshToken(): string | undefined {
    return this.refreshToken;
  }
  getConnection(): number {
    if (!this.connectionId) throw new Error('Connection is not set');
    return this.connectionId;
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
  }
}
