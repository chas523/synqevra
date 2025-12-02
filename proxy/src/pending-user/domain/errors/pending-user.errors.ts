export class UserAlreadyExistsError extends Error {
  static readonly message = 'User already exists';

  public readonly code = 'USER.ALREADY_EXISTS';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserAlreadyExistsError.message);
    if (cause) {
      this.stack += '\nCaused by: ' + cause.stack;
    }
    // Optionally attach metadata if needed
    (this as any).metadata = metadata;
  }
}

export class UserNotFoundError extends Error {
  static readonly message = 'User not found';

  public readonly code = 'USER.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserNotFoundError.message);
    if (cause) {
      this.stack += '\nCaused by: ' + cause.stack;
    }
    // Optionally attach metadata if needed
    (this as any).metadata = metadata;
  }
}
