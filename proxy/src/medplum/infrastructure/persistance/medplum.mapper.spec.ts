import { Medplum } from './medplum.entity';
import { Connection } from '../../../connection/infrastructure/persistance/connection.entity';
import { MedplumMapper } from './medplum.mapper';
import { MedplumModel } from '../../domain/entities/medplum.model';

describe('MedplumMapper', () => {
  describe('toDomain', () => {
    it('should map fields and connectionId when connection is present', () => {
      const entity = new Medplum();
      entity.id = 1;
      entity.client_id = 'client-id';
      entity.client_secret = 'client-secret';
      entity.connection = { id: 123 } as Connection;

      const model = MedplumMapper.toDomain(entity);

      expect(model).toStrictEqual({
        id: 1,
        client_id: 'client-id',
        client_secret: 'client-secret',
        connectionId: 123,
      });
    });

    it('should set connectionId as undefined when connection is missing', () => {
      const entity = new Medplum();
      entity.id = 1;
      entity.client_id = 'client-id';
      entity.client_secret = 'client-secret';

      const model = MedplumMapper.toDomain(entity);

      expect(model.connectionId).toBeUndefined();
      expect(model).toStrictEqual({
        id: 1,
        client_id: 'client-id',
        client_secret: 'client-secret',
        connectionId: undefined,
      });
    });
  });

  describe('toOrm', () => {
    it('should map fields with connection when connectionId is present', () => {
      const model: MedplumModel = {
        id: 1,
        client_id: 'client-id',
        client_secret: 'client-secret',
        connectionId: 123,
      };

      const entity = MedplumMapper.toOrm(model);

      expect(entity.id).toBe(1);
      expect(entity.client_id).toBe('client-id');
      expect(entity.client_secret).toBe('client-secret');
      expect(entity.connection).toStrictEqual({ id: 123 });
    });

    it('should not set id when model.id is undefined', () => {
      const model: MedplumModel = {
        client_id: 'client-id',
        client_secret: 'client-secret',
        connectionId: 123,
      };

      const entity = MedplumMapper.toOrm(model);

      expect(entity.id).toBeUndefined();
      expect(entity.client_id).toBe('client-id');
      expect(entity.client_secret).toBe('client-secret');
      expect(entity.connection).toStrictEqual({ id: 123 } as Connection);
    });

    it('should not set connection when connectionId is undefined', () => {
      const model: MedplumModel = {
        id: 1,
        client_id: 'client-id',
        client_secret: 'client-secret',
      };

      const entity = MedplumMapper.toOrm(model);

      expect(entity.id).toBe(1);
      expect(entity.client_id).toBe('client-id');
      expect(entity.client_secret).toBe('client-secret');
      expect(entity.connection).toBeUndefined();
    });
  });
});
