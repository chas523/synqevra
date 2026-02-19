import { Injectable } from "@nestjs/common";
import { Role } from "src/iam/domain/enums/role.enum";
import { AdminRepository } from "src/iam/domain/repositories/admin.repository";
import { UserRepository } from "src/iam/domain/repositories/user.repository";

@Injectable()
export class GetUserProfileUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly adminRepository: AdminRepository
    ) { }

    async execute(userId: number, userRole: Role) {
        if (userRole === Role.ADMIN) {
            const admin = await this.adminRepository.getAdminByIdSafe(userId);
            return admin;
        }
        const user = await this.userRepository.getUserByIdNoToken(userId);
        return { ...user, role: userRole };
    }
}