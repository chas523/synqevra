import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { OutboxStatus } from '../../domain/enums/outbox-status.enum';
import { OutboxRepository } from '../../domain/repositories/outbox.repository';

@Injectable()
export class ReplayOutboxEntryUseCase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly outboxRepository: OutboxRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const outboxRepo = this.outboxRepository.withManager(manager);
      const row = await outboxRepo.findById(id);

      if (!row) {
        throw new NotFoundException(`Outbox entry ${id} not found`);
      }

      await outboxRepo.updateDispatchState({
        id,
        attempts: 0,
        status: OutboxStatus.PENDING,
        nextAttemptAt: new Date(),
        lastError: undefined,
        deliveredAt: undefined,
      });
    });
  }
}
