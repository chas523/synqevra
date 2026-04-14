import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Admin } from './infrastructure/persistance/admin.entity';
import { Role } from './domain/enums/role.enum';

@Injectable()
export class AdminInitService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin) private readonly adminRepo: Repository<Admin>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.config.get<string>('DEFAULT_ADMIN_EMAIL');
    const password = this.config.get<string>('DEFAULT_ADMIN_PASSWORD');
    if (!email || !password) return;
    const admin = await this.adminRepo.findOne({ where: { email } });
    if (!admin) {
      await this.adminRepo.save({
        firstName: 'Admin',
        lastName: 'Admin',
        email,
        password, // already hashed
        role: Role.ADMIN,
        hashedRt: null,
      });
    }
  }
}
