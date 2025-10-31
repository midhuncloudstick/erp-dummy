import { api } from './EventServices';
import { EmployeeResponse } from '@/types/employee';

export const employeeService = {
  async getEmployees(page: number = 1, limit: number = 50): Promise<EmployeeResponse> {
    const response = await api.getEvents(`/employee?page=${page}&limit=${limit}`);
    return response.data as EmployeeResponse;
  },

  async createEmployee(formData: FormData): Promise<{ success: boolean; message?: string }> {
    // Let axios set the boundary automatically
    const response = await api.postEvents('/employee', formData);
    return response.data;
  },

  async getEmployeeById(id: number): Promise<{ response: any; success: boolean }> {
    const response = await api.getEvents(`/employee/${id}`);
    return response.data;
  },

  async updateEmployee(employeeId: number, adminId: number, formData: FormData): Promise<{ success: boolean; message?: string }> {
    const response = await api.patchEvent(`/employee/${employeeId}/admin/${adminId}`, formData);
    return response.data;
  },
  async toggleEmployeeStatus(employeeId: number): Promise<{ success: boolean; message?: string }> {
    const response = await api.patchEvent(`/employee/${employeeId}/activate`);
    return response.data;
  },
  
};


