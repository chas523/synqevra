import { Module } from '@nestjs/common';
import { MedplumService } from './medplum.service';

@Module({
  providers: [MedplumService],
  exports: [MedplumService],
})
export class MedplumModule {}
