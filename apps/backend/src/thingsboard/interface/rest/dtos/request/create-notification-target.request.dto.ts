export class CreateNotificationTargetRequestDto {
  name: string;
  configuration: {
    type: 'PLATFORM_USERS';
    usersFilter: {
      type: 'ALL_USERS' | 'TENANT_ADMINISTRATORS' | 'SYSTEM_ADMINISTRATORS';
      tenantsIds?: string[];
      tenantProfilesIds?: string[];
    };
    description?: string;
  };
}
