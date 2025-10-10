export interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'textarea';
  required?: boolean;
  placeholder?: string;
  gridCols?: number; // for responsive grid layout
}

export const tenantFields: FieldConfig[] = [
  {
    name: 'title',
    label: 'Title*',
    required: true,
    placeholder: 'Title is required.',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
  },
  {
    name: 'country',
    label: 'Country',
  },
  {
    name: 'city',
    label: 'City',
    gridCols: 1,
  },
  {
    name: 'state',
    label: 'State / Province',
    gridCols: 1,
  },
  {
    name: 'zipCode',
    label: 'Zip / Postal Code',
    gridCols: 1,
  },
  {
    name: 'address',
    label: 'Address',
  },
  {
    name: 'address2',
    label: 'Address 2',
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'tel',
    placeholder: 'Phone Number in E.164 format, ex. +12015550123',
  },
  {
    name: 'tenantEmail',
    label: 'Email',
    type: 'email',
  },
];

export const userFields: FieldConfig[] = [
  {
    name: 'userEmail',
    label: 'Email*',
    type: 'email',
    required: true,
  },
  {
    name: 'firstName',
    label: 'First name',
  },
  {
    name: 'lastName',
    label: 'Last name',
  },
  {
    name: 'userPhone',
    label: 'Phone',
    type: 'tel',
    placeholder: 'Phone Number in E.164 format, ex. +12015550123',
  },
  {
    name: 'userDescription',
    label: 'Description',
    type: 'textarea',
  },
  {
    name: 'password',
    label: 'Password*',
    type: 'password',
    required: true,
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password*',
    type: 'password',
    required: true,
  },
];
