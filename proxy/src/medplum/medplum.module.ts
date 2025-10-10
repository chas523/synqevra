import { Module } from '@nestjs/common';
import { MedplumService } from './medplum.service';
import { MedplumController } from './medplum.controller';
import { Medplum } from '../entities/medplum.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionService } from '../connection/connection.service';
import { Connection } from '../entities/connection.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Medplum, Connection]), UsersModule],
  controllers: [MedplumController],
  providers: [MedplumService, ConnectionService],
  exports: [MedplumService],
})
export class MedplumModule {}
