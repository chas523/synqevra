import { ThingsboardModel } from 'src/thingsboard/domain/models/thingsboard.model';

export abstract class ThingsboardRepositoryPort {
  abstract save(thingsboard: ThingsboardModel): Promise<ThingsboardModel>;
  abstract findByUserId(userId: number): Promise<ThingsboardModel | null>;
  abstract update(thingsboard: ThingsboardModel): Promise<ThingsboardModel>;
}

export const THINGSBOARD_REPOSITORY_PORT = Symbol(
  'THINGSBOARD_REPOSITORY_PORT',
);
