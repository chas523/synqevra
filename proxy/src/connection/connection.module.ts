import { forwardRef, Module } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { ConnectionController } from './connection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from '../entities/connection.entity';
import { HttpModule } from '@nestjs/axios';
import { PendingUserModule } from 'src/pending-user/pending-user.module';
import { MedplumConnectionService } from './medplum-connection.service';
import { UsersModule } from '../users/users.module';
import { MedplumModule } from '../medplum/medplum.module';
import { ThingsboardModule } from '../thingsboard/thingsboard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Connection]),
    HttpModule,
    PendingUserModule,
    UsersModule,
    forwardRef(() => MedplumModule),
    forwardRef(() => ThingsboardModule),
  ],
  controllers: [ConnectionController],
  providers: [ConnectionService, MedplumConnectionService],
  exports: [ConnectionService, MedplumConnectionService],
})
export class ConnectionModule {}
