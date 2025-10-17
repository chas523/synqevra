import { Module } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { ConnectionController } from './connection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from '../entities/connection.entity';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';
import { ThingsboardService } from 'src/thingsboard/thingsboard.service';
import { HttpModule } from '@nestjs/axios';
import { PendingUserModule } from 'src/pending-user/pending-user.module';
import { UsersModule } from 'src/users/users.module';
import { forwardRef } from '@nestjs/common';
import { ThingsboardModule } from 'src/thingsboard/thingsboard.module';
import { MedplumModule } from 'src/medplum/medplum.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Connection, User]),
    HttpModule,
    PendingUserModule,
    UsersModule,
    forwardRef(() => ThingsboardModule),
    forwardRef(() => MedplumModule),
  ],
  controllers: [ConnectionController],
  providers: [ConnectionService],
  exports: [ConnectionService],
})
export class ConnectionModule {}
