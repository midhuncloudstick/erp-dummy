export interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  company_name?: string;
  role?: string;
  userType: 'admin' | 'customer';
}

export interface LoginRequest {
  email: string;
  password: string;
  login_type?: 'customer' | 'admin' | '';
}

export interface LoginResponse {
  response: {
    email: string;
    full_name: string;
    id: number;
    role?: string;
    userType: 'admin' | 'customer';
    message: string;
  };
  
  success: boolean;
  token?: string; // Assuming token is still here
}

export interface RegisterRequest {
  full_name: string;
  company_name?: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface RegisterResponse {
  message: string;
}
