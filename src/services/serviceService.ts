import { api } from './EventServices';
import { 
  Service, 
  ServiceResponse, 
  CreateServiceRequest, 
  CreateServiceResponse, 
  ToggleStatusResponse,
  PurchasedServiceResponse,
  PurchasedServiceDetailsResponse,
  UpdateCredentialsRequest,
  UpdateCredentialsResponse
} from '@/types/service';

export const serviceService = {
  // Get all services
  async getServices(page: number = 1, limit: number = 10): Promise<ServiceResponse> {
    const response = await api.getEvents(`/services?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get service by ID
  async getServiceById(id: number): Promise<{ response: { data: Service }; success: boolean }> {
    const response = await api.getEvents(`/services/${id}`);
    return response.data;
  },

  // Create a new service
  async createService(serviceData: CreateServiceRequest): Promise<CreateServiceResponse> {
    const response = await api.postEvents('/services', serviceData);
    return response.data;
  },

  // Update a service
  async updateService(id: number, serviceData: Partial<CreateServiceRequest>): Promise<CreateServiceResponse> {
    const response = await api.patchEvent(`/services/${id}`, serviceData);
    return response.data;
  },

  // Delete a service
  async deleteService(id: number): Promise<{ success: boolean }> {
    const response = await api.deleteEvents(`/services/${id}`);
    return response.data;
  },

  // Toggle service status (enable/disable)
  async toggleServiceStatus(id: number): Promise<ToggleStatusResponse> {
    const response = await api.putEvent(`/services/${id}/toggle-status`, {});
    return response.data;
  },

  // Get purchased services for a customer
  async getPurchasedServices(customerId: number): Promise<PurchasedServiceResponse> {
    const response = await api.getEvents(`/customers/${customerId}/purchased_service/list`);
    return response.data;
  },

  // Get purchased service details by ID
  async getPurchasedServiceDetails(customerId: number, serviceId: number): Promise<PurchasedServiceDetailsResponse> {
    const response = await api.getEvents(`/customers/${customerId}/purchased_service/${serviceId}/details`);
    return response.data;
  },

  // Update purchased service credentials
  async updatePurchasedServiceCredentials(customerId: number, serviceId: number, credentials: UpdateCredentialsRequest): Promise<UpdateCredentialsResponse> {
    const response = await api.patchEvent(`/customers/${customerId}/purchased_service/${serviceId}/update`, credentials);
    return response.data;
  },
}; 