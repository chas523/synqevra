import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserRepository } from '../../domain/repositories/user.repository';
import { ConnectionRepository } from '../../../connection/domain/repositories/connection.repository';
import { CreatePendingUserCommand } from '../../../pending-user/application/commands/create-pending-user/create-pending-user.command';
import { GetPendingUserByEmailQuery } from 'src/pending-user/application/queries/get-pending-user-by-email/get-pending-user-by-email.query';
import { PendingUserStatus } from 'src/pending-user/domain/enums/status.enum';

export interface ValidateGoogleUserCommand {
    email: string;
    firstName: string;
    lastName: string;
}

@Injectable()
export class ValidateGoogleUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly connectionRepository: ConnectionRepository,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) { }

    async execute(command: ValidateGoogleUserCommand) {
        const { email, firstName, lastName } = command;

        // 1. Check if user already exists
        const user = await this.userRepository.getUserByEmail(email);

        //user exists
        if (user && user.id) {

            //user has no password - that means he's been invited by another user and haven't activated his account yet (doesn't have role and connections to other tables).
            //notify him to activate his account first
            if (!user.password) {
                return {
                    status: 'EXISTING_PENDING_USER',
                    isPending: true,
                    user: null,
                };
            }
            //user exists - we log him in. Get the role to ensure current user gets correct JWT payload
            const connection = await this.connectionRepository.getConnectionByUserId(user.id);
            return {
                status: 'EXISTING_ACTIVE_USER',
                isPending: false,
                user: {
                    id: user.id,
                    connectionRole: connection?.role,
                },
            };
        }
        //check if user exists as pending user
        const pendingUserByEmailQuery = new GetPendingUserByEmailQuery({ email })
        const pendingUserResult = await this.queryBus.execute(pendingUserByEmailQuery);

        if (pendingUserResult.isOk()) {
            const pendingUser = pendingUserResult.unwrap();

            if (pendingUser && pendingUser.getStatus() === PendingUserStatus.NEW) {
                return {
                    status: 'EXISTING_PENDING_USER',
                    isPending: false,
                    user: null,
                };
            }
            if (pendingUser && pendingUser.getStatus() === PendingUserStatus.PENDING) {
                return {
                    status: 'EXISTING_PENDING_USER',
                    isPending: true,
                    user: null,
                };
            }
        }


        // 2. User not found, dispatch command to create PendingUser
        const createPendingCommand = new CreatePendingUserCommand({
            email,
            firstName,
            lastName,
        });

        await this.commandBus.execute(createPendingCommand);

        return {
            status: 'NEW_PENDING_USER',
            isPending: false,
            user: null,
        };
    }
}
