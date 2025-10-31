import { api } from './EventServices';
import { Customer } from '@/types/customer';

export interface CustomerResponse {
  response: CustomerPaginationData;
  success: boolean;
}
export interface CustomerPaginationData {
    data: Customer[]; 
    limit: number;
    page: number;
    total_count: number;
    total_pages: number;
}
interface CustomerParams {
    search?: string;
    page?: number;
    limit?: number;
}

export interface CreateCustomerResponse {
  response:{
  data : Customer;
  
}

}

export const customerService = {
  async getIndustries(): Promise<{ id: number; name: string }[]> {
    const response = await api.getEvents(`/industry`);
    return response.data;
    return [];
  },

 async getCustomer(params: CustomerParams): Promise<CustomerResponse> {
    const baseUrl = `/customer`;
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append("search", params.search);
    if (typeof params.page === "number") queryParams.append("page", String(params.page));
    if (typeof params.limit === "number") queryParams.append("limit", String(params.limit));

    const url = `${baseUrl}?${queryParams.toString()}`;
    
    
    const response = await api.getEvents(url)
    return response.data; 
},
   
  async getCustomerById( id:number) :Promise<CustomerResponse> {
    const response = await api.getEvents(`/customer/${id}`)
    return response.data;
  },

 async addCustomer(
  customer: Omit<Customer, 'id'> & { product_id?: number; FullName?: string; Full_name?: string }
): Promise<CreateCustomerResponse> {
  const payload: Partial<Customer> & { product_id?: number } = { ...customer };

  // Resolve full name
  const resolvedFullName =
    customer.FullName?.trim() ||
    customer.Full_name?.trim() ||
    `${(customer as any).first_name ?? ''} ${(customer as any).last_name ?? ''}`.trim();

  if (resolvedFullName) payload.Full_name = resolvedFullName;

  // Remove frontend-only fields
  delete (payload as any).FullName;
  delete (payload as any).first_name;
  delete (payload as any).last_name;

  if (payload.country_code === '') delete payload.country_code;

  // Uncomment when calling real API
  const response = await api.postEvents(`/customer/admin`, payload);
  return response.data;

  return { data: payload as Customer, success: true }; // set true if stub simulates success
},


  async updateCustomer(id: number, customer: Partial<Customer>): Promise<CreateCustomerResponse> {
    const response = await api.patchEvent(`/customer/${id}`, customer);
    return response.data;
    return { data: {} as Customer, success: false };
  },

  async deleteCustomer(id: number): Promise<{ success: boolean }> {
    const response = await api.deleteEvents(`/customer/${id}`);
    return response.data;
    return { success: false };
  },
 
  async getCustomerProfile(id:number){
    const response = await api.getEvents(`customer/${id}/profile`);
    return response.data;
  },

  async updateCustomerProfile(id:number, payload:Partial<Customer>){
    const response = await api.patchEvent(`customer/${id}/profile/update`,payload);
    return response.data;
  }
};


