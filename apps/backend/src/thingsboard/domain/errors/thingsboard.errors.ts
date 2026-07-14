export abstract class ThingsboardDomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Auth errors
export class InvalidCredentialsError extends ThingsboardDomainError {
  public readonly code = 'AUTH.INVALID_CREDENTIALS';

  constructor() {
    super('Invalid username or password');
  }
}

export class InvalidTokenError extends ThingsboardDomainError {
  public readonly code = 'AUTH.INVALID_TOKEN';

  constructor() {
    super('Invalid or expired access token');
  }
}

export class ExpiredTokenError extends ThingsboardDomainError {
  public readonly code = 'AUTH.TOKEN_EXPIRED';

  constructor(message?: string) {
    super(message || 'Token has expired');
  }
}

export class TokenRefreshError extends ThingsboardDomainError {
  public readonly code = 'AUTH.TOKEN_REFRESH_FAILED';

  constructor() {
    super('Failed to refresh token');
  }
}

// Tenant errors
export class TenantCreationError extends ThingsboardDomainError {
  public readonly code = 'TENANT.CREATION_FAILED';

  constructor(reason?: string) {
    super(reason || 'Failed to create tenant');
  }
}

export class TenantNotFoundError extends ThingsboardDomainError {
  public readonly code = 'TENANT.NOT_FOUND';

  constructor(tenantId: string) {
    super(`Tenant ${tenantId} not found`);
  }
}

export class TenantDeletionError extends ThingsboardDomainError {
  public readonly code = 'TENANT.DELETION_FAILED';

  constructor(tenantId: string) {
    super(`Failed to delete tenant ${tenantId}`);
  }
}

// User errors
export class UserAlreadyExistsError extends ThingsboardDomainError {
  public readonly code = 'USER.ALREADY_EXISTS';

  constructor(message: string) {
    super(message);
  }
}

export class UserCreationError extends ThingsboardDomainError {
  public readonly code = 'USER.CREATION_FAILED';

  constructor(reason?: string) {
    super(`Failed to create user${reason ? `: ${reason}` : ''}`);
  }
}

export class UserNotFoundError extends ThingsboardDomainError {
  public readonly code = 'USER.NOT_FOUND';

  constructor() {
    super('User not found');
  }
}

export class UserActivationError extends ThingsboardDomainError {
  public readonly code = 'USER.ACTIVATION_FAILED';

  constructor() {
    super('Failed to activate user account');
  }
}

// Rule Chain errors
export class RuleChainCreationError extends ThingsboardDomainError {
  public readonly code = 'RULE_CHAIN.CREATION_FAILED';

  constructor() {
    super('Failed to create rule chain');
  }
}

export class RuleChainConfigurationError extends ThingsboardDomainError {
  public readonly code = 'RULE_CHAIN.CONFIGURATION_FAILED';

  constructor() {
    super('Failed to configure rule chain');
  }
}

export class RuleChainUpdateError extends ThingsboardDomainError {
  public readonly code = 'RULE_CHAIN.UPDATE_FAILED';

  constructor() {
    super('Failed to update rule chain');
  }
}

// Device Profile errors
export class DeviceProfileNotFoundError extends ThingsboardDomainError {
  public readonly code = 'DEVICE_PROFILE.NOT_FOUND';

  constructor() {
    super('Device profile not found');
  }
}

export class DeviceProfileUpdateError extends ThingsboardDomainError {
  public readonly code = 'DEVICE_PROFILE.UPDATE_FAILED';

  constructor() {
    super('Failed to update device profile');
  }
}

// Connection errors
export class ThingsboardConnectionError extends ThingsboardDomainError {
  public readonly code = 'CONNECTION.FAILED';

  constructor() {
    super('Failed to connect to ThingsBoard');
  }
}

export class ThingsboardConnectionNotFoundError extends ThingsboardDomainError {
  public readonly code = 'CONNECTION.NOT_FOUND';

  constructor() {
    super('ThingsBoard connection not found for user');
  }
}

export class ThingsboardConnectionExistsError extends ThingsboardDomainError {
  public readonly code = 'CONNECTION.ALREADY_EXISTS';

  constructor() {
    super('ThingsBoard connection already exists for this user');
  }
}

// Validation errors
export class PasswordMismatchError extends ThingsboardDomainError {
  public readonly code = 'VALIDATION.PASSWORD_MISMATCH';

  constructor() {
    super('Passwords do not match');
  }
}

export class InvalidActivationLinkError extends ThingsboardDomainError {
  public readonly code = 'VALIDATION.INVALID_ACTIVATION_LINK';

  constructor() {
    super('Invalid activation link format');
  }
}

// Union types for different operations
export type RegisterTenantError =
  | TenantCreationError
  | UserCreationError
  | UserAlreadyExistsError
  | RuleChainCreationError
  | RuleChainConfigurationError
  | RuleChainUpdateError
  | DeviceProfileUpdateError
  | ThingsboardConnectionExistsError
  | PasswordMismatchError
  | UserActivationError
  | InvalidActivationLinkError;

export type LoginError = InvalidCredentialsError | ThingsboardConnectionError;

export type RefreshTokenError =
  | TokenRefreshError
  | ExpiredTokenError
  | ThingsboardConnectionNotFoundError;

export type GetUserError = InvalidTokenError | ThingsboardConnectionError;

export type ConfirmPractitionerError =
  | TenantCreationError
  | UserCreationError
  | ThingsboardConnectionExistsError
  | PasswordMismatchError;
