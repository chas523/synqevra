import { Injectable } from '@nestjs/common';
import { UnitOfWorkFactory } from '../../connection/infrastructure/transaction/unit-of-work.factory';
import { CreateMedplumTenantUseCase } from './use-cases/create-medplum-tenant.use-case';
import { CreateMedplumRequestDto } from '../interface/rest/dto/create-medplum.request.dto';

@Injectable()
export class CreateMedplumTenantOrchestrator {
    constructor(
        private readonly unitOfWorkFactory: UnitOfWorkFactory,
        private readonly createMedplumTenantUseCase: CreateMedplumTenantUseCase,
    ) { }

    async run(dto: CreateMedplumRequestDto): Promise<void> {
        const uow = await this.unitOfWorkFactory.create();

        try {
            await this.createMedplumTenantUseCase.execute(dto, uow);
            await uow.commit();
        } catch (error) {
            await uow.rollback();
            throw error;
        } finally {
            await uow.release();
        }
    }
}
