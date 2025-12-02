import { PendingUserStatus } from '../enums/status.enum';
import { EmailAddress } from '../value-objects/email-address.vo';

export class PendingUserModel {
  constructor(
    private firstName: string,
    private lastName: string,
    private email: EmailAddress,
    private status: PendingUserStatus,
    private readonly id?: number,
    private readonly createdAt?: Date,
    private activationToken?: string,
    private expiresAt?: Date,
  ) {}
  static create(
    firstName: string,
    lastName: string,
    email: EmailAddress,
  ): PendingUserModel {
    if (!firstName || !lastName) {
      throw new Error('First name and last name are required');
    }
    return new PendingUserModel(
      firstName,
      lastName,
      email,
      PendingUserStatus.NEW,
    );
  }
  getId(): number {
    if (!this.id) throw new Error('Model has not been persisted yet');
    return this.id;
  }

  isPersisted(): boolean {
    return this.id !== undefined;
  }
  setActivationToken(token: string, expiresAt: Date): void {
    this.activationToken = token;
    this.expiresAt = expiresAt;
  }
  getFirstName(): string {
    return this.firstName;
  }
  getLastName(): string {
    return this.lastName;
  }
  getEmail(): EmailAddress {
    return this.email;
  }
  getCreatedAt(): Date {
    if (!this.createdAt) throw new Error('Model has not been persisted yet');
    return this.createdAt;
  }
  getStatus(): PendingUserStatus {
    return this.status;
  }
  setStatus(status: PendingUserStatus): void {
    this.status = status;
  }
}
