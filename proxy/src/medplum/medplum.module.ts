import { Module } from '@nestjs/common';
import { MedplumService } from './medplum.service';
import { MedplumController } from './medplum.controller';
import { Medplum } from '../entities/medplum.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Medplum])],
  controllers: [MedplumController],
  providers: [MedplumService],
  exports: [MedplumService],
})
export class MedplumModule {}
