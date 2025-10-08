import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medplum } from '../entities/medplum.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MedplumService {
  constructor(
    @InjectRepository(Medplum)
    private readonly medplumService: Repository<Medplum>,
  ) {}

  async getMedplumEntityById(id: number): Promise<Medplum | null> {
    return await this.medplumService.findOne({
      where: { id },
    });
  }
}
