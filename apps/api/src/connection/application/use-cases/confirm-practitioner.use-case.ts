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

@Injectable()
export class ConfirmPractitionerUseCase {
  constructor(
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    @Inject(ActivationLinkRepository)
    private readonly activationLinkRepository: ActivationLinkRepository,
    private readonly medplum: MedplumClientFactory,
    @Inject(ConnectionRepository)
    private readonly connectionRepository: ConnectionRepository,
    @Inject(MedplumRepository)
    private readonly medplumRepository: MedplumRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly updateUserUseCase: UpdateUserUseCase,

    private readonly commandBus: CommandBus,
  ) {}

  async execute(
    formData: ConfirmPractitionerCommandForm,
    token: string,
  ): Promise<any> {
    try {
      console.log('Starting ConfirmPractitioner use case');
      console.log('Form data:', formData);
      console.log('Token:', token);

      await this.validateTokenUseCase.execute(token);
      console.log('Token validated successfully');

      const newUserId =
        this.validateTokenUseCase.extractPayloadFromToken(token).subjectId;
      console.log('Extracted newUserId:', newUserId);

      const activationLinkRecord =
        await this.activationLinkRepository.findByUserId(Number(newUserId));
      console.log('Activation link record:', activationLinkRecord);

      const user = await this.userRepository.getUserById(Number(newUserId));

      if (!activationLinkRecord || !user) {
        throw new Error('Invalid activation link');
      }

      if (user.email !== formData.userEmail) {
        throw new Error('Email in form does not match user email');
      }

      const tenantId = activationLinkRecord.tenantId;
      console.log('TenantId:', tenantId);

      //thingsboard
      //here we get thingsboardid
      console.log('Executing ConfirmPractitionerCommand...');
      const thingsboardResult = await this.commandBus.execute(
        new ConfirmPractitionerCommand(formData, tenantId, Number(newUserId)),
      );
      if (thingsboardResult.isErr()) {
        throw thingsboardResult.unwrapErr();
      }
      const thingsboardData = thingsboardResult.unwrap();
      console.log('Thingsboard result:', thingsboardData);

      //our db
      console.log('Fetching connection by tenantId:', tenantId);
      const userFromCurrentProjectConnection =
        await this.connectionRepository.getConnectionByTenantId(tenantId);
      console.log(
        'User from current project connection:',
        userFromCurrentProjectConnection,
      );

      //update connection to point to medplum entity
      console.log('Fetching practitioner connection for userId:', newUserId);
      const practitionerConnection =
        await this.connectionRepository.getOrCreateByUserId(Number(newUserId));
      console.log('Practitioner connection:', practitionerConnection);
      if (
        practitionerConnection &&
        userFromCurrentProjectConnection?.medplumId
      ) {
        practitionerConnection.medplumId =
          userFromCurrentProjectConnection.medplumId;
        console.log('practitionerconnection is now:', practitionerConnection);
        await this.connectionRepository.save(practitionerConnection);
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
      };
      await this.updateUserUseCase.execute(updateUserCommand);
      console.log('User password updated successfully');

      //medplum
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

      const practitionerId = inviteResult.profile.reference.split('/')[1];
      console.log('Extracted practitionerId:', practitionerId);

      console.log('Setting password for practitioner:', practitionerId);
      await client.post(`admin/projects/setpassword`, {
        email: formData.userEmail,
        password: formData.password,
      });
      console.log('Password set successfully');

      // 5. Opcjonalna aktualizacja dodatkowych pól w Practitionerze
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
    } catch (error) {
      console.error('Error confirming practitioner:', error.message);
      throw error;
    }
  }
}
