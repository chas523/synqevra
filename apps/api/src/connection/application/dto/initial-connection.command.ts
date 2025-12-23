class TenantFieldsCommand {
  title: string;
  description?: string;
  country?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  address?: string;
  address2?: string;
  phone?: string;
  tenantEmail?: string;
}

class UserFieldsCommand {
  userEmail: string;
  firstName?: string;
  lastName?: string;
  userPhone?: string;
  userDescription?: string;
  password: string;
  confirmPassword: string;
}

export class InitialConnectionCommand {
  tenantFields: TenantFieldsCommand;
  userFields: UserFieldsCommand;
}
