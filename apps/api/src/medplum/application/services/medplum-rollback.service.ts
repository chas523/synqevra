import { Injectable, Logger } from '@nestjs/common';
import { MedplumClientFactory } from '../medplum-client.factory';
import { MedplumClient } from '@medplum/core';

export interface MedplumRollbackData {
  tenantId: string;
  practitionerId: string;
  userId: string;
  projectMembershipId: string;
}

@Injectable()
export class MedplumRollbackService {
  private readonly logger = new Logger(MedplumRollbackService.name);

  constructor(private readonly medplumClientFactory: MedplumClientFactory) {}

  async rollbackPractitioner(rollbackData: MedplumRollbackData): Promise<void> {
    this.logger.warn('Starting Medplum rollback');
    const { tenantId, practitionerId, userId, projectMembershipId } =
      rollbackData;

    try {
      const client: MedplumClient = await this.medplumClientFactory.initMedplum(
        undefined,
        tenantId,
      );

      // Delete ProjectMembership
      if (projectMembershipId) {
        try {
          this.logger.log(`Deleting ProjectMembership: ${projectMembershipId}`);
          await client.deleteResource('ProjectMembership', projectMembershipId);
          this.logger.log('ProjectMembership deleted successfully');
        } catch (error) {
          this.logger.warn(
            `Failed to delete ProjectMembership ${projectMembershipId}:`,
            error.message,
          );
        }
      }

      // Delete Practitioner
      if (practitionerId) {
        try {
          this.logger.log(`Deleting Practitioner: ${practitionerId}`);
          await client.deleteResource('Practitioner', practitionerId);
          this.logger.log('Practitioner deleted successfully');
        } catch (error) {
          this.logger.warn(
            `Failed to delete Practitioner ${practitionerId}:`,
            error.message,
          );
        }
      }

      // Delete User
      if (userId) {
        try {
          this.logger.log(`Deleting User: ${userId}`);
          await client.deleteResource('User', userId);
          this.logger.log('User deleted successfully');
        } catch (error) {
          this.logger.warn(`Failed to delete User ${userId}:`, error.message);
        }
      }

      this.logger.log('Medplum rollback completed');
    } catch (error) {
      this.logger.error('Error during Medplum rollback:', error.message);
      // Don't throw - we want to continue with other rollbacks even if Medplum fails
    }
  }
}
