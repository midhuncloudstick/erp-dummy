import { api } from './EventServices';

// Define interfaces for the lead data structure
export interface Industry {
  id: number;
  industry_name: string;
  description: string;
}

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
  industry: Industry;
}

export interface Product {
  id: number;
  product_name: string;
  description: string;
}

export interface Middleman {
  id: number;
  full_name: string;
  phone_number: string;
  email: string;
  address: string;
}

export interface Company {
  id: number;
  company_name: string;
  legal_structure: string;
  register_number: string;
  gst_number: string;
  industry_type: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_active: boolean;
  company_default: boolean;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

export interface Shift {
  id: number;
  shift_name: string;
  start_time: string;
  end_time: string;
  shift_duration: string;
  is_active: boolean;
}

export interface Employee {
  id: number;
  profile_pic: string;
  full_name: string;
  company_id: number;
  company_name: string;
  company: Company;
  role_id: number;
  role_name: string;
  role: Role;
  department_id: number;
  department_name: string;
  department: Department;
  email: string;
  phone_number: string;
  address: string;
  is_active: boolean;
  join_date: string;
  created_at: string;
  updated_at: string;
  DeletedAt: string | null;
  InviteToken: string;
  token_expires_at: string;
  salary: string;
  employment_type: string;
  shift_id: number | null;
  shift: Shift;
}

export interface Note {
  id: number;
  lead_id: string;
  note: string;
  date: string;
}

export interface Reminder {
  id: number;
  lead_id: string;
  date: string;
  description: string;
}

export interface Lead {
  id: string;
  customer_id: number;
  customer: Customer;
  product_id: number;
  product: Product;
  middleman_id: number;
  middleman: Middleman;
  description: string;
  estimated_cost: number;
  reports_to: any;
  employees: Employee[];
  notes: Note[];
  reminder: Reminder[];
  to_do_list: any[];
  attachments: any[];
  status: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  industry: string;
  location: string;
}

export interface LeadsResponse {
  data: Lead[];
  limit: number;
  page: number;
  success: boolean;
  total_Leads: number;
  total_pages: number;
}

export const leadService = {
  async getLeads(): Promise<LeadsResponse> {
    const response = await api.getEvents('/leads');
    return response.data;
  },

  async getLeadById(id: string): Promise<{ data: Lead; success: boolean }> {
    const response = await api.getEvents(`/leads/${id}`);
    return response.data;
  },

  async createLead(leadData: Partial<Lead>): Promise<{ data: Lead; success: boolean }> {
    const response = await api.postEvents('/leads', leadData);
    return response.data;
  },

  async updateLead(id: string, leadData: Partial<Lead>): Promise<{ data: Lead; success: boolean }> {
    const response = await api.patchEvent(`/leads/${id}`, leadData);
    return response.data;
  },

  async deleteLead(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.deleteEvents(`/leads/${id}`);
    return response.data;
  }
};
