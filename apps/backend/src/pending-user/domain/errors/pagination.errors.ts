export class DisallowedSortFieldsError extends Error {
  static readonly message = 'Cannot sort by the specified fields';

  public readonly code = 'PAGINATION.DISALLOWED_SORT_FIELDS';

  constructor(message: string, cause?: Error, metadata?: unknown) {
    super(DisallowedSortFieldsError.message);
    if (cause) {
      this.stack += '\nCaused by: ' + cause.stack;
      this.message += `: ${message}`;
    }
    // Optionally attach metadata if needed
    (this as any).metadata = metadata;
  }
}
export class CursorCodingError extends Error {
  static readonly message = 'Invalid cursor format';

  public readonly code = 'PAGINATION.INVALID_CURSOR_FORMAT';

  constructor(message?: string, cause?: Error, metadata?: unknown) {
    super(CursorCodingError.message);
    if (cause) {
      this.stack += '\nCaused by: ' + cause.stack;
      this.message += `: ${message}`;
    }
    // Optionally attach metadata if needed
    (this as any).metadata = metadata;
  }
}
