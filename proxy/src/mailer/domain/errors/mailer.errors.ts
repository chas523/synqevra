export class MailerDomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'MailerDomainError';
  }
}

export class EmailSendError extends MailerDomainError {
  constructor(message?: string) {
    super('EMAIL_SEND_ERROR', message || 'Failed to send email');
  }
}

export class ActivationLinkUserNotFoundError extends MailerDomainError {
  constructor(email: string) {
    super(
      'ACTIVATION_LINK_USER_NOT_FOUND',
      `User with email ${email} not found for activation link creation`,
    );
  }
}

export type CreateActivationLinkError =
  | EmailSendError
  | ActivationLinkUserNotFoundError;
