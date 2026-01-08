import { Inject, Injectable } from '@nestjs/common';
import { ValidateTokenUseCase } from './validate-token.use-case';
import { ActivationLinkRepository } from 'src/iam/domain/repositories/activation-link.repository';
import { MedplumClientFactory } from 'src/medplum/application/medplum-client.factory';
import { InviteRequest, MedplumClient } from '@medplum/core';
import { ProjectMembership } from '@medplum/fhirtypes';
import { ConnectionRepository } from 'src/connection/domain/repositories/connection.repository';
import { ConnectionModel } from 'src/connection/domain/entities/connection.model';
import { Role } from 'src/iam/domain/enums/role.enum';
import { CommandBus } from '@nestjs/cqrs';
import { ConfirmPractitionerCommand } from 'src/thingsboard/application/commands/confirm-practitioner/confirm-practitioner-tenant.command';
import { ConfirmPractitionerCommandForm } from '../dto/confirm-practitioner.command';
import { MedplumRepository } from 'src/medplum/domain/repositories/medplum.repository';
import { UpdateUserUseCase } from 'src/iam/application/use-cases/update-user.use-case';
import { UpdateUserCommand } from 'src/iam/application/dto/update-user.command';
import { UserRepository } from 'src/iam/domain/repositories/user.repository';
import { UnitOfWork } from 'src/connection/infrastructure/transaction/unit-of-work';
import { ConfirmPractitionerResult } from '../dto/confirm-practitioner.result';
import { ThingsboardRollbackService } from 'src/thingsboard/application/services/thingsboard-rollback.service';
import { RollbackData } from 'src/thingsboard/interface/rest/dtos/response/register-tenant.response.dto';
import { MedplumRollbackService } from 'src/medplum/application/services/medplum-rollback.service';

@Injectable()
export class ConfirmPractitionerUseCase {
  constructor(
    private readonly validateTokenUseCase: ValidateTokenUseCase,

    private readonly medplum: MedplumClientFactory,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly thingsboardRollbackService: ThingsboardRollbackService,
    private readonly medplumRollbackService: MedplumRollbackService,

    private readonly commandBus: CommandBus,
  ) {}

  async execute(
    formData: ConfirmPractitionerCommandForm,
    token: string,
    uow: UnitOfWork,
  ): Promise<ConfirmPractitionerResult> {
    console.log('Starting ConfirmPractitioner use case');
    console.log('Form data:', formData);
    console.log('Token:', token);

    //only selects from our db.
    await this.validateTokenUseCase.execute(token);
    console.log('Token validated successfully');

    const newUserId =
      this.validateTokenUseCase.extractPayloadFromToken(token).subjectId;
    console.log('Extracted newUserId:', newUserId);

    const activationLinkRecord =
      await uow.activationLinkRepository.findByUserId(Number(newUserId));
    console.log('Activation link record:', activationLinkRecord);

    const user = await uow.userRepository.getUserById(Number(newUserId));

    if (!activationLinkRecord || !user) {
      throw new Error('Invalid activation link');
    }

    if (user.email !== formData.userEmail) {
      throw new Error('Email in form does not match user email');
    }

    const tenantId = activationLinkRecord.tenantId;
    console.log('TenantId:', tenantId);

    //our db
    console.log('Fetching connection by tenantId:', tenantId);
    const userFromCurrentProjectConnection =
      await uow.connectionRepository.getConnectionByTenantId(tenantId);
    console.log(
      'User from current project connection:',
      userFromCurrentProjectConnection,
    );

    //update connection to point to medplum entity
    console.log('Fetching practitioner connection for userId:', newUserId);
    const practitionerConnection =
      await uow.connectionRepository.getOrCreateByUserId(Number(newUserId));
    console.log('Practitioner connection:', practitionerConnection);
    if (practitionerConnection && userFromCurrentProjectConnection?.medplumId) {
      practitionerConnection.medplumId =
        userFromCurrentProjectConnection.medplumId;
      console.log('practitionerconnection is now:', practitionerConnection);
      await uow.connectionRepository.save(practitionerConnection);
      console.log(
        'Practitioner connection linked to medplum ID:',
        userFromCurrentProjectConnection.medplumId,
      );
    }
    //update user password
    console.log('Updating user password for userId:', newUserId);
    const updateUserCommand: UpdateUserCommand = {
      userId: Number(newUserId),
      password: formData.password,
      uow: uow,
    };
    await this.updateUserUseCase.execute(updateUserCommand);
    console.log('User password updated successfully');

    //thingsboard
    //here we get thingsboardid
    console.log('Executing ConfirmPractitionerCommand...');

    let rollbackData: RollbackData = {
      tenantId: '',
      userId: '',
      sysAdminAccessToken: '',
    };

    const thingsboardResult = await this.commandBus.execute(
      new ConfirmPractitionerCommand(
        formData,
        tenantId,
        Number(newUserId),
        uow,
      ),
    );
    if (thingsboardResult.isErr()) {
      //we throw error and it's no need to rollback anything as our database rollbacks automatically, thingsboard rollback mechanism works inside ConfirmPractitionerCommand and nothing was created in medplum yet
      throw thingsboardResult.unwrapErr();
    }
    const thingsboardData = thingsboardResult.unwrap();
    rollbackData = thingsboardData.rollbackData;
    console.log('Thingsboard result:', thingsboardData);

    //medplum
    try {
      console.log('Initializing Medplum client for tenantId:', tenantId);
      const client: MedplumClient = await this.medplum.initMedplum(
        undefined,
        tenantId,
      );
      console.log('Medplum client initialized');

      const medplumProjectId = client.getProject()?.id;
      console.log('Medplum project ID:', medplumProjectId);

      if (!medplumProjectId) {
        throw new Error('Medplum project not found for the tenant');
      }

      const body: InviteRequest = {
        resourceType: 'Practitioner',
        firstName: formData.firstName ?? ' ',
        lastName: formData.lastName ?? ' ',
        email: formData.userEmail,
        sendEmail: false,
        scope: 'project',
      };
      console.log('Invite request body:', body);

      const inviteResult = (await client.invite(
        medplumProjectId,
        body,
      )) as ProjectMembership;
      console.log('Invite result:', inviteResult);

      if (!inviteResult.profile.reference) {
        throw new Error('Practitioner reference not found in invite result');
      }

      if (!inviteResult.id) {
        throw new Error('Project membership ID not found in invite result');
      }

      const practitionerId = inviteResult.profile.reference.split('/')[1];
      console.log('Extracted practitionerId:', practitionerId);

      //from this point on, if something fails, we need to rollback Medplum resources (client.invite created User, Practitioner, ProjectMembership)
      try {
        console.log('Setting password for practitioner:', practitionerId);
        await client.post(`admin/projects/setpassword`, {
          email: formData.userEmail,
          password: formData.password,
        });
        console.log('Password set successfully');

        if (formData.userPhone || formData.userDescription) {
          console.log(
            'Updating practitioner additional fields for ID:',
            practitionerId,
          );
          const practitioner = await client.readResource(
            'Practitioner',
            practitionerId,
          );
          console.log('Fetched practitioner:', practitioner);

          await client.updateResource({
            ...practitioner,
            telecom: [
              ...(practitioner.telecom || []),
              { system: 'phone', value: formData.userPhone },
            ],
            extension: [
              {
                url: 'https://medplum.com/fhir/StructureDefinition/user-description',
                valueString: formData.userDescription,
              },
            ],
          });
          console.log('Practitioner updated successfully');
        }

        console.log(
          'Practitioner confirmed and account activated:',
          practitionerId,
        );

        return {
          success: true,
          practitionerId: inviteResult.profile.id,
          message: 'Practitioner confirmed and account activated',
        };
      } catch (medplumOperationError) {
        console.error(
          'Error during Medplum post-invite operations:',
          medplumOperationError,
        );
        console.log('Rolling back Medplum resources due to error');

        if (!inviteResult.user?.reference) {
          throw new Error(
            'User reference not found in invite result. Delete it manually from medplum',
          );
        }

        const userId = inviteResult.user.reference.split('/')[1];
        await this.medplumRollbackService.rollbackPractitioner({
          tenantId: tenantId,
          practitionerId: practitionerId,
          userId: userId,
          projectMembershipId: inviteResult.id,
        });
        throw medplumOperationError;
      }
    } catch (medplumError) {
      console.error('Error during Medplum operations:', medplumError);
      console.log('Rolling back Thingsboard changes due to Medplum error');
      await this.thingsboardRollbackService.rollbackTenantAdmin({
        tenantId: rollbackData.tenantId,
        userId: rollbackData.userId,
        sysAdminAccessToken: rollbackData.sysAdminAccessToken,
      });
      throw medplumError;
    }
  }
}
