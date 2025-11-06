export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  surname: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}
