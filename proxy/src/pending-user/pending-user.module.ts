import { Module } from '@nestjs/common';
// import { PendingUserService } from './pending-user.service';
// import { PendingUserController } from './pending-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PendingUserRepositoryAdapter } from './infrastructure/persistence/pending-user.repository.adapter';
import { PENDING_USER_REPOSITORY_PORT } from './application/ports/pending-user.repository.port';
import { CreatePendingUserCommandHandler } from './application/commands/create-pending-user/create-pending-user.command-handler';
import { PendingUserController } from './interface/rest/pending-user.controller';
import { PendingUser } from './infrastructure/persistence/pending-user.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { GetPendingUserListPaginatedQueryHandler } from './application/queries/get-pending-user-list-paginated.query/get-pending-user-list-paginated.query-handler';
import { GetPendingUserByIdQueryHandler } from './application/queries/get-pending-user-by-id/get-pending-user-by-id.query-handler';
import { PendingUserService } from './application/pending-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([PendingUser]), CqrsModule],
  // providers: [PendingUserService],
  controllers: [PendingUserController],

  // exports: [PendingUserService],
  providers: [
    CreatePendingUserCommandHandler,
    GetPendingUserListPaginatedQueryHandler,
    GetPendingUserByIdQueryHandler,

    PendingUserService,
    {
      provide: PENDING_USER_REPOSITORY_PORT,
      useClass: PendingUserRepositoryAdapter,
    },
  ],
  exports: [PendingUserService],
})
export class PendingUserModule {}
