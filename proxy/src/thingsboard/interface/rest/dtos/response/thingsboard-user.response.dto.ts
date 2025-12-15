export class ThingsboardUserResponseDto {
  id: {
    entityType: string;
    id: string;
  };
  createdTime: number;
  tenantId: {
    entityType: string;
    id: string;
  };
  customerId: {
    entityType: string;
    id: string;
  };
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  authority: string;
  additionalInfo?: Record<string, any>;
}
