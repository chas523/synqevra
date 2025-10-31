import { forwardRef, Module } from '@nestjs/common';
import { MedplumService } from './medplum.service';
import { MedplumController } from './medplum.controller';
import { Medplum } from '../entities/medplum.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from '../entities/connection.entity';
import { ConnectionModule } from 'src/connection/connection.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medplum, Connection]),
    forwardRef(() => ConnectionModule),
  ],
  controllers: [MedplumController],
  providers: [MedplumService],
  exports: [MedplumService],
})
export class MedplumModule {}
