export interface CustomField {
  id?: number;
  service_id?: number;
  field_name: string;
  field_type: 'string' | 'digit' | 'password' | 'select';
  is_mandatory: boolean;
  field_select?: Array<{ options: string }>;
}

export interface Service {
  id: number;
  name: string;
  category_id: number;
  category: {
    id: number;
    category: string;
  };
  type: 'onetime' | 'recurring';
  monthly_cost?: string;
  yearly_cost?: string;
  one_time_cost?: string;
  features: string[];
  custom_fields?: CustomField[];
  status: 'active' | 'inactive';
}

export interface ServiceResponse {
  response: {
    data: Service[];
    limit: number;
    page: number;
    total_count: number;
    total_pages: number;
  };
  success: boolean;
}

export interface CreateServiceRequest {
response:{
    name: string;
  type: 'onetime' | 'recurring';
  category_id: number;
  one_time_cost?: string;
  monthly_cost?: string;
  yearly_cost?: string;
  features: string[];
  custom_fields?: CustomField[];
}
}

export interface CreateServiceResponse {
  response: Service;
  success: boolean;
}

export interface ToggleStatusResponse {
  success: boolean;
  message?: string;
}

// Purchased Service Types
export interface Customer {
  id: number;
  full_name: string;
  company_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  country_code: string;
  note: string;
  password: string;
  confirm_password: string;
  industry_id: number;
  industry: {
    id: number;
    industry_name: string;
    description: string;
  };
}

export interface Credential {
  id: number;
  customer_id: number;
  customer_service_id: number;
  custom_field_id: number;
  custom_field_title: string;
  custom_field_value: string;
}

export interface PurchasedService {
  id: number;
  customer_id: number;
  service_id: number;
  payment_type: string;
  billing_type: string;
  billing_method: string | null;
  billing_cost: string;
  registered_date: string;
  order_id: string;
  status: 'created' | 'active' | 'inactive' | 'cancelled';
  customer: Customer;
  service: Service;
  credentials: Credential[];
}

export interface PurchasedServiceResponse {
  data: PurchasedService[];
  limit: number;
  page: number;
  success: boolean;
  total_pages: number;
  total_services: number;
}

export interface PurchasedServiceDetailsResponse {
  data: PurchasedService;
  success: boolean;
}

export interface UpdateCredentialsRequest {
  credentials: Array<{
    id: number;
    custom_field_value: string;
  }>;
}

export interface UpdateCredentialsResponse {
  success: boolean;
  message?: string;
} 