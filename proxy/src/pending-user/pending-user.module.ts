import { Module } from '@nestjs/common';
import { PendingUserService } from './pending-user.service';
import { PendingUserController } from './pending-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingUser } from '../entities/pending-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PendingUser])],
  providers: [PendingUserService],
  controllers: [PendingUserController],
  exports: [PendingUserService],
})
export class PendingUserModule {}
