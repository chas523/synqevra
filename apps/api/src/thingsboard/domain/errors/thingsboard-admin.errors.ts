export abstract class ThingsboardAdminDomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class TBAdminGetError extends ThingsboardAdminDomainError {
  public readonly code = 'TB_ADMIN.GET_FAILED';
  constructor() {
    super('Failed to get resources from Thingsboard Admin');
  }
}

export class TBAdminGetTenantsUsersError extends ThingsboardAdminDomainError {
  public readonly code = 'TB_ADMIN.GET_TENANTS_USERS_FAILED';
  constructor() {
    super('Failed to get tenants users from Thingsboard Admin');
  }
}

export class TBAdminGetTenantDevicesError extends ThingsboardAdminDomainError {
  public readonly code = 'TB_ADMIN.GET_TENANT_DEVICES_FAILED';
  constructor() {
    super('Failed to get tenant devices from Thingsboard Admin');
  }
}

export class TBAdminGetNotificationsError extends ThingsboardAdminDomainError {
  public readonly code = 'TB_ADMIN.GET_NOTIFICATIONS_FAILED';
  constructor() {
    super('Failed to get notifications from Thingsboard Admin');
  }
}
