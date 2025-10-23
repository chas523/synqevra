import { forwardRef, Module } from '@nestjs/common';
import { MedplumService } from './medplum.service';
import { MedplumController } from './medplum.controller';
import { Medplum } from '../entities/medplum.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from '../entities/connection.entity';
import { UsersModule } from '../users/users.module';
import { ConnectionModule } from 'src/connection/connection.module';
import { ProxyModule } from 'src/proxy/proxy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medplum, Connection]),
    UsersModule,
    forwardRef(() => ConnectionModule),
    ProxyModule,
  ],
  controllers: [MedplumController],
  providers: [MedplumService],
  exports: [MedplumService],
})
export class MedplumModule {}
