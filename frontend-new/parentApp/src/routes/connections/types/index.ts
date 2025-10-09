export interface MedplumStatusResponse {
  status: 'Connected' | 'Disconnected';
  clientId?: string;
}

export interface ThingsboardStatusResponse {
  status: 'Connected' | 'Disconnected';
  tenantId?: string;
}

import type { RegisterFormData } from '@/routes/auth/types';

export type EstablishMedplumConnectionInterface = RegisterFormData & {
  projectName: string;
};

export interface EstablishThingsboardConnectionInterface {
  // Tenant data (left section)
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

  // User data (right section)
  userEmail: string;
  firstName: string;
  lastName: string;
  userPhone?: string;
  userDescription?: string;
  password: string;
  confirmPassword: string;
}

// New types for nested API structure
export interface TenantFormFields {
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

export interface UserFormFields {
  userEmail: string;
  firstName?: string;
  lastName?: string;
  userPhone?: string;
  userDescription?: string;
  password: string;
  confirmPassword: string;
}

export interface ThingsboardApiData {
  tenantFields: TenantFormFields;
  userFields: UserFormFields;
}

// Response from ThingsBoard connection API
export interface ThingsboardConnectionResponse {
  success: boolean;
  tenantId: string;
  accessToken: string;
  refreshToken: string;
  message: string;
}
