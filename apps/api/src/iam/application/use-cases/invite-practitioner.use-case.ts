import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { InvitePractitionerCommand } from '../dto/invite-practitioner.command';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Role } from '../../domain/enums/role.enum';
import {
  EmailPort,
  EMAIL_PORT,
} from '../../../mailer/application/ports/email.port';
import { SendEmailDto } from '../../../mailer/interface/rest/dtos/request/send-email.request.dto';
import { ActivationLinkRepository } from 'src/iam/domain/repositories/activation-link.repository';
import { TokenGeneratorPort } from '../ports/token-generator.port';
import {
  ThingsboardRepositoryPort,
  THINGSBOARD_REPOSITORY_PORT,
} from 'src/thingsboard/application/ports/thingsboard.repository.port';

@Injectable()
export class InvitePractitionerUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    @Inject(ActivationLinkRepository)
    private readonly activationLinkRepository: ActivationLinkRepository,
    @Inject(EMAIL_PORT)
    private readonly emailPort: EmailPort,
    @Inject(TokenGeneratorPort)
    private readonly tokenGeneratorPort: TokenGeneratorPort,
    @Inject(THINGSBOARD_REPOSITORY_PORT)
    private readonly thingsboardRepository: ThingsboardRepositoryPort,
  ) {}

  async execute(
    command: InvitePractitionerCommand,
  ): Promise<{ id: number; email: string; activationToken: string }> {
    const { firstName, lastName, email, currentUser } = command;

    const currentUserThingsboard =
      await this.thingsboardRepository.findByUserId(currentUser.id);
    if (!currentUserThingsboard) {
      throw new BadRequestException(
        'Current user does not have a ThingsBoard connection',
      );
    }
    const currentUserTenantId = currentUserThingsboard.getTenantId();

    //check if user with the same email already exists in the same tenant
    const existingUser = await this.userRepository.getUserByEmail(email);
    if (existingUser && existingUser.id != null) {
      //user exists, but is invited (has no connection reference & has row in activation-link table )
      const existingUserActivationLink =
        await this.activationLinkRepository.findByUserId(existingUser.id);
      if (existingUserActivationLink?.tenantId === currentUserTenantId) {
        throw new BadRequestException(
          `User with email ${email} has already been invited to this project`,
        );
      }

      //user exists has connection to thingsboard (not invited)
      const existingUserThingsboard =
        await this.thingsboardRepository.findByUserId(existingUser.id);
      if (existingUserThingsboard) {
        const existingUserTenantId = existingUserThingsboard.getTenantId();
        if (existingUserTenantId === currentUserTenantId) {
          throw new BadRequestException(
            `User with email ${email} already exists in this project`,
          );
        }
      }
    }

    const userModel = await this.userRepository.save({
      firstName,
      lastName,
      email,
      hashedRt: null,
    });

    if (userModel.id == null) {
      throw new BadRequestException('Failed to create user');
    }

    const { tokenPayloadEncoded, hash } =
      this.tokenGeneratorPort.createActivationToken({
        type: 'user',
        subjectId: userModel.id.toString(),
      });
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 godziny

    await this.activationLinkRepository.save({
      token: hash, // Przechowujemy hash do weryfikacji
      userId: userModel.id,
      tenantId: currentUserTenantId,
      expiresAt,
    });

    // Wysłanie emaila z linkiem aktywacyjnym
    const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/activate?token=${tokenPayloadEncoded}`;
    const emailDto: SendEmailDto = {
      recipients: [{ address: email, name: `${firstName} ${lastName}` }],
      subject: 'Activate your account',
      html: this.generateActivationEmailTemplate(firstName, activationUrl),
    };

    await this.emailPort.sendEmail(emailDto);

    return {
      id: userModel.id,
      email: userModel.email,
      activationToken: tokenPayloadEncoded, // Do wysłania w emailu
    };
  }

  private generateActivationEmailTemplate(
    firstName: string,
    activationUrl: string,
  ): string {
    return `
        <h2>Hello ${firstName}!</h2>
        <p>To activate your account and set your password, click the link below:</p>
        <a href="${activationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Activate Account
        </a>
        <p>This link expires in 24 hours.</p>
        <p>If you did not request an invitation, please ignore this message.</p>
    `;
  }
}
