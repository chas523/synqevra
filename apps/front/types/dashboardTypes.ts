export interface EntityId {
  entityType: string;
  id: string;
}

export interface Dashboard {
  id: EntityId;
  createdTime: number;
  tenantId: EntityId;
  title: string;
  image: string | null;
  assignedCustomers: AssignedCustomer[];
  mobileHide: boolean;
  mobileOrder: number | null;
  version: number;
  name: string;
  configuration?: {
    description?: string;
    widgets?: Record<string, any>;
    states?: Record<string, any>;
    entityAliases?: Record<string, any>;
    filters?: Record<string, any>;
    timewindow?: any;
    settings?: any;
  };
  externalId?: EntityId;
}

export interface AssignedCustomer {
  customerId: EntityId;
  title: string;
  public: boolean;
}

export interface DashboardsResponse {
  data: Dashboard[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}
