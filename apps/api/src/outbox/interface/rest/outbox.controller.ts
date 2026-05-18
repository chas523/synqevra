import { Controller, Param, Post } from '@nestjs/common';

import { ReplayOutboxEntryUseCase } from '../../application/use-cases/replay-outbox-entry.use-case';

@Controller('outbox')
export class OutboxController {
  constructor(private readonly replayOutboxEntry: ReplayOutboxEntryUseCase) {}

  @Post('replay/:id')
  async replayDeadMessage(@Param('id') id: string): Promise<{ ok: true }> {
    await this.replayOutboxEntry.execute(id);
    return { ok: true };
  }
}
