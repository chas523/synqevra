export interface NotificationTargetDto {
  id: {
    id: string;
    entityType: string;
  };
  createdTime: number;
  name: string;
  configuration: {
    type: 'PLATFORM_USERS';
    usersFilter: {
      type: 'ALL_USERS' | 'TENANT_ADMINISTRATORS' | 'SYSTEM_ADMINISTRATORS';
      tenantsIds?: string[];
      tenantProfilesIds?: string[];
    };
    description?: string | null;
  };
}

export interface NotificationTargetsResponse {
  targets: NotificationTargetDto[];
  totalElements: number;
  totalPages: number;
}
