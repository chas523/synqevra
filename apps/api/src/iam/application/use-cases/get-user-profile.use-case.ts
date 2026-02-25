import { Injectable, Inject } from "@nestjs/common";
import { Role } from "src/iam/domain/enums/role.enum";
import { AdminRepository } from "src/iam/domain/repositories/admin.repository";
import { UserRepository } from "src/iam/domain/repositories/user.repository";
import { THINGSBOARD_REPOSITORY_PORT, ThingsboardRepositoryPort } from "src/thingsboard/application/ports/thingsboard.repository.port";

@Injectable()
export class GetUserProfileUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly adminRepository: AdminRepository,
        @Inject(THINGSBOARD_REPOSITORY_PORT)
        private readonly thingsboardRepository: ThingsboardRepositoryPort
    ) { }

    async execute(userId: number, userRole: Role) {
        if (userRole === Role.ADMIN) {
            const admin = await this.adminRepository.getAdminByIdSafe(userId);
            return { ...admin, tenantId: null };
        }
        const user = await this.userRepository.getUserByIdNoToken(userId);
        let tenantId: string | null = null;
        if (user) {
            const thingsboard = await this.thingsboardRepository.findByUserId(userId);
            if (thingsboard) {
                tenantId = thingsboard.getTenantId();
            }
        }
        return { ...user, role: userRole, tenantId };
    }
}