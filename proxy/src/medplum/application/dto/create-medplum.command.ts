import { ConnectionModel } from '../../../connection/domain/entities/connection.model';

export interface CreateMedplumCommand {
  client_id: string;
  client_secret: string;
  connection: ConnectionModel;
}
