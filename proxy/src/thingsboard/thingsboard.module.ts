import { Module } from '@nestjs/common';
import { ThingsboardService } from './thingsboard.service';
import { ThingsboardController } from './thingsboard.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ThingsboardService],
  controllers: [ThingsboardController],
})
export class ThingsboardModule {}
