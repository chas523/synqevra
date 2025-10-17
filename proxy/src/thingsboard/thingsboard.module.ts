import { Module } from '@nestjs/common';
import { ThingsboardService } from './thingsboard.service';
import { ThingsboardController } from './thingsboard.controller';
import { HttpModule } from '@nestjs/axios';
import { Thingsboard } from 'src/entities/thingsboard.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef } from '@nestjs/common';
import { ConnectionModule } from 'src/connection/connection.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => ConnectionModule),
    TypeOrmModule.forFeature([Thingsboard]),
  ],
  providers: [ThingsboardService],
  controllers: [ThingsboardController],
  exports: [ThingsboardService],
})
export class ThingsboardModule {}
