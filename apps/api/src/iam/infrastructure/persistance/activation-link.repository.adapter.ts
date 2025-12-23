import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivationLink } from './activation-link.entity';
import { ActivationLinkRepository } from '../../domain/repositories/activation-link.repository';

@Injectable()
export class ActivationLinkRepositoryAdapter extends ActivationLinkRepository {
  constructor(
    @InjectRepository(ActivationLink)
    private readonly repository: Repository<ActivationLink>,
  ) {
    super();
  }

  async save(data: {
    token: string;
    userId: number;
    expiresAt: Date | null;
  }): Promise<ActivationLink> {
    const activationLink = this.repository.create(data);
    return await this.repository.save(activationLink);
  }

  async findByToken(token: string): Promise<ActivationLink | null> {
    return await this.repository.findOne({ where: { token } });
  }

  async findByUserId(userId: number): Promise<ActivationLink | null> {
    return await this.repository.findOne({ where: { userId } });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.repository.delete({ userId });
  }
}
