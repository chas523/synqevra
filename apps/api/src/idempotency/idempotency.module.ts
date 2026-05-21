import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IdempotencyRepository } from './domain/repositories/idempotency.repository';
import { IdempotencyKey } from './infrastructure/persistence/idempotency-key.entity';
import { IdempotencyRepositoryAdapter } from './infrastructure/persistence/idempotency.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([IdempotencyKey])],
  providers: [
    {
      provide: IdempotencyRepository,
      useClass: IdempotencyRepositoryAdapter,
    },
  ],
  exports: [IdempotencyRepository],
})
export class IdempotencyModule {}
